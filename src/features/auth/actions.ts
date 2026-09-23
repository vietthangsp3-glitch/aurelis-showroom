"use server";

import { compare } from "bcryptjs";
import { authenticator } from "otplib";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSession, destroySession } from "@/lib/auth/session";
import { prisma } from "@/lib/database/prisma";
import { digestIdentifier } from "@/lib/security/digest";

export interface LoginState {
  error?: string;
}

const loginSchema = z.object({
  email: z.string().trim().email().max(160),
  password: z.string().min(8).max(128),
  mfaCode: z
    .union([z.literal(""), z.string().regex(/^\d{6}$/)])
    .optional()
    .default(""),
});

const loginWindowMs = 15 * 60 * 1000;
const maxIpAttempts = 12;
const maxAccountAttempts = 5;
const lockDurationMs = 15 * 60 * 1000;

async function requestIpHash() {
  const requestHeaders = await headers();
  const forwarded = requestHeaders
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  const ip = forwarded || requestHeaders.get("x-real-ip") || "unknown";
  return digestIdentifier(ip);
}

function bucketSuffix(now: Date) {
  return Math.floor(now.getTime() / loginWindowMs);
}

export async function login(
  _state: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: "Email hoặc mật khẩu chưa hợp lệ." };

  const email = parsed.data.email.toLowerCase();
  const emailHash = digestIdentifier(email);
  const ipHash = await requestIpHash();
  const now = new Date();
  const suffix = bucketSuffix(now);
  const ipKey = `login:ip:${ipHash}:${suffix}`;
  const accountKey = `login:account:${emailHash}:${suffix}`;

  try {
    const [, ipBucket, accountBucket] = await prisma.$transaction([
      prisma.rateLimitBucket.deleteMany({ where: { resetAt: { lt: now } } }),
      prisma.rateLimitBucket.upsert({
        where: { key: ipKey },
        create: {
          key: ipKey,
          count: 1,
          resetAt: new Date(now.getTime() + loginWindowMs),
        },
        update: { count: { increment: 1 } },
      }),
      prisma.rateLimitBucket.upsert({
        where: { key: accountKey },
        create: {
          key: accountKey,
          count: 1,
          resetAt: new Date(now.getTime() + loginWindowMs),
        },
        update: { count: { increment: 1 } },
      }),
    ]);

    if (
      ipBucket.count > maxIpAttempts ||
      accountBucket.count > maxAccountAttempts
    ) {
      return { error: "Đăng nhập tạm thời bị giới hạn. Vui lòng thử lại sau." };
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (user?.lockedUntil && user.lockedUntil > now) {
      return { error: "Đăng nhập tạm thời bị khóa. Vui lòng thử lại sau." };
    }

    const valid = Boolean(
      user?.active && (await compare(parsed.data.password, user.passwordHash)),
    );
    if (!valid || !user) {
      if (user) {
        const failures = user.failedLoginCount + 1;
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginCount: failures >= maxAccountAttempts ? 0 : failures,
            lockedUntil:
              failures >= maxAccountAttempts
                ? new Date(now.getTime() + lockDurationMs)
                : null,
          },
        });
      }

      await prisma.auditLog.create({
        data: {
          userId: user?.id,
          action: "AUTH_LOGIN_FAILED",
          entityType: "AUTH",
          entityId: emailHash,
          ipAddress: `sha256:${ipHash}`,
        },
      });

      return { error: "Email hoặc mật khẩu không chính xác." };
    }

    if (user.role === "ADMIN" && process.env.REQUIRE_ADMIN_MFA === "true") {
      const mfaSecret = process.env.ADMIN_TOTP_SECRET;
      const mfaValid =
        Boolean(mfaSecret) &&
        Boolean(parsed.data.mfaCode) &&
        authenticator.check(parsed.data.mfaCode, mfaSecret!);

      if (!mfaValid) {
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: "AUTH_MFA_FAILED",
            entityType: "AUTH",
            entityId: user.id,
            ipAddress: `sha256:${ipHash}`,
          },
        });
        return {
          error: mfaSecret
            ? "Mã xác thực hai bước không chính xác."
            : "MFA quản trị chưa được cấu hình.",
        };
      }
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: now },
      }),
      prisma.rateLimitBucket.deleteMany({
        where: { key: { in: [ipKey, accountKey] } },
      }),
      prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "AUTH_LOGIN_SUCCESS",
          entityType: "AUTH",
          entityId: user.id,
          ipAddress: `sha256:${ipHash}`,
        },
      }),
    ]);

    await createSession({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("admin login failed", error);
    return { error: "Không thể đăng nhập lúc này. Vui lòng thử lại." };
  }

  redirect("/admin/dashboard");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}
