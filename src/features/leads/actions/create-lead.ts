"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/database/prisma";
import { leadSchema } from "@/features/leads/schemas/lead";
import { digestIdentifier } from "@/lib/security/digest";

export interface LeadActionState {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
}

const initialError: LeadActionState = {
  ok: false,
  message: "Không thể gửi yêu cầu. Vui lòng thử lại.",
};

export async function createLead(
  _previousState: LeadActionState,
  formData: FormData,
): Promise<LeadActionState> {
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");
  const host = requestHeaders.get("host");
  try {
    if (origin && host && new URL(origin).host !== host) {
      return { ok: false, message: "Nguồn gửi yêu cầu không hợp lệ." };
    }
  } catch {
    return { ok: false, message: "Nguồn gửi yêu cầu không hợp lệ." };
  }

  const parsed = leadSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return {
      ok: false,
      message: "Vui lòng kiểm tra lại thông tin.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  if (!process.env.DATABASE_URL) {
    return { ok: false, message: "Hệ thống dữ liệu chưa được cấu hình." };
  }

  const forwardedFor =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ipHash = digestIdentifier(forwardedFor);
  const fingerprint = digestIdentifier(
    `${parsed.data.phone}:${parsed.data.carId ?? ""}:${parsed.data.interestType}`,
  );
  const now = new Date();
  const bucketKey = `lead:${ipHash}:${now.toISOString().slice(0, 13)}`;

  try {
    const result = await prisma.$transaction(async (tx) => {
      await tx.rateLimitBucket.deleteMany({ where: { resetAt: { lt: now } } });
      const bucket = await tx.rateLimitBucket.upsert({
        where: { key: bucketKey },
        create: {
          key: bucketKey,
          count: 1,
          resetAt: new Date(now.getTime() + 60 * 60 * 1000),
        },
        update: { count: { increment: 1 } },
      });
      if (bucket.count > 8) throw new Error("RATE_LIMIT");

      const duplicate = await tx.lead.findFirst({
        where: {
          fingerprint,
          createdAt: { gte: new Date(now.getTime() - 15 * 60 * 1000) },
        },
        select: { id: true },
      });
      if (duplicate) return { duplicate: true };

      if (parsed.data.carId) {
        const variant = await tx.vehicleVariant.findFirst({
          where: { id: parsed.data.carId, vehicle: { status: "PUBLISHED" } },
          select: { id: true },
        });
        if (!variant) throw new Error("INVALID_REFERENCE");
      }

      await tx.lead.create({
        data: {
          name: parsed.data.name,
          phone: parsed.data.phone,
          email: parsed.data.email || null,
          variantId: parsed.data.carId || null,
          brand: parsed.data.brand || null,
          interestType: parsed.data.interestType,
          preferredContactTime: parsed.data.preferredContactTime,
          note: parsed.data.note || null,
          source: parsed.data.source,
          landingPage: parsed.data.landingPage || null,
          referrer: parsed.data.referrer || null,
          fingerprint,
          submissionKey: parsed.data.submissionKey,
        },
      });
      return { duplicate: false };
    });

    return {
      ok: true,
      message: result.duplicate
        ? "Yêu cầu đã được ghi nhận trước đó. Chuyên viên sẽ sớm liên hệ."
        : "Cảm ơn bạn. Chuyên viên AURELIA sẽ liên hệ trong thời gian sớm nhất.",
    };
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMIT") {
      return {
        ok: false,
        message: "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.",
      };
    }
    if (error instanceof Error && error.message === "INVALID_REFERENCE") {
      return { ok: false, message: "Mẫu xe đã chọn không còn khả dụng." };
    }
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { ok: true, message: "Yêu cầu của bạn đã được ghi nhận." };
    }
    console.error("createLead failed", error);
    return initialError;
  }
}
