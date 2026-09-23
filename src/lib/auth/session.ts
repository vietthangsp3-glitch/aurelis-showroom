import { randomUUID } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/database/prisma";

export type AppRole = "ADMIN" | "EDITOR" | "SALES";

export interface AppSession {
  userId: string;
  name: string;
  email: string;
  role: AppRole;
}

const cookieName = "aurelia.session";
const issuer = "aurelia";
const audience = "aurelia-admin";
const maxAgeSeconds = 60 * 60 * 4;
const idleTimeoutMs = 30 * 60 * 1000;
const touchIntervalMs = 5 * 60 * 1000;

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SESSION_SECRET chưa được cấu hình an toàn.");
    }
    return new TextEncoder().encode("development-only-secret-change-me-now");
  }
  return new TextEncoder().encode(value);
}

async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, secret(), { issuer, audience });
  if (typeof payload.sub !== "string" || typeof payload.jti !== "string")
    return null;
  return { userId: payload.sub, sessionId: payload.jti };
}

export async function createSession(session: AppSession) {
  const id = randomUUID();
  const expiresAt = new Date(Date.now() + maxAgeSeconds * 1000);

  await prisma.$transaction([
    prisma.authSession.deleteMany({ where: { expiresAt: { lt: new Date() } } }),
    prisma.authSession.create({
      data: { id, userId: session.userId, expiresAt },
    }),
  ]);

  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(session.userId)
    .setJti(id)
    .setIssuer(issuer)
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .sign(secret());

  const cookieStore = await cookies();
  cookieStore.set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;

  if (token) {
    try {
      const claims = await verifyToken(token);
      if (claims) {
        await prisma.authSession.updateMany({
          where: {
            id: claims.sessionId,
            userId: claims.userId,
            revokedAt: null,
          },
          data: { revokedAt: new Date() },
        });
      }
    } catch {
      // Cookie vẫn bị xóa kể cả khi token hỏng/hết hạn.
    }
  }

  cookieStore.delete(cookieName);
}

export async function getSession(): Promise<AppSession | null> {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;

  try {
    const claims = await verifyToken(token);
    if (!claims) return null;

    const authSession = await prisma.authSession.findUnique({
      where: { id: claims.sessionId },
      include: { user: true },
    });
    const now = new Date();

    if (
      !authSession ||
      authSession.userId !== claims.userId ||
      authSession.revokedAt ||
      authSession.expiresAt <= now ||
      !authSession.user.active
    ) {
      return null;
    }

    if (now.getTime() - authSession.lastSeenAt.getTime() > idleTimeoutMs) {
      await prisma.authSession.update({
        where: { id: authSession.id },
        data: { revokedAt: now },
      });
      return null;
    }

    if (now.getTime() - authSession.lastSeenAt.getTime() > touchIntervalMs) {
      await prisma.authSession.update({
        where: { id: authSession.id },
        data: { lastSeenAt: now },
      });
    }

    return {
      userId: authSession.user.id,
      name: authSession.user.name,
      email: authSession.user.email,
      role: authSession.user.role as AppRole,
    };
  } catch {
    return null;
  }
}

export async function requireRole(roles: AppRole[]) {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!roles.includes(session.role))
    redirect("/admin/dashboard?error=forbidden");
  return session;
}
