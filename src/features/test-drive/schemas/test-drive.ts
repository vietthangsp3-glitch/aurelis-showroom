import { z } from "zod";
import { normalizePhone } from "@/lib/utils";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export const testDriveSchema = z.object({
  name: z.string().trim().min(2, "Vui lòng nhập họ và tên.").max(80),
  phone: z
    .string()
    .transform(normalizePhone)
    .pipe(z.string().regex(/^0\d{9}$/, "Số điện thoại chưa đúng định dạng.")),
  email: z
    .union([z.literal(""), z.string().email("Email chưa đúng định dạng.")])
    .optional(),
  variantId: z.string().min(1, "Vui lòng chọn xe.").max(80),
  showroomId: z.string().min(1, "Vui lòng chọn showroom.").max(80),
  date: z.string().regex(datePattern, "Ngày lái thử chưa hợp lệ."),
  time: z.string().regex(timePattern, "Giờ lái thử chưa hợp lệ."),
  note: z.string().trim().max(800).optional(),
  source: z.string().trim().max(80).default("test-drive-page"),
  landingPage: z.string().trim().max(500).optional(),
  referrer: z.string().trim().max(500).optional(),
  submissionKey: z.string().uuid(),
  website: z.string().max(0, "Yêu cầu không hợp lệ."),
  consent: z.literal("on", {
    errorMap: () => ({ message: "Bạn cần đồng ý để gửi yêu cầu." }),
  }),
});

export type TestDriveInput = z.infer<typeof testDriveSchema>;

export function scheduledAtFromInput(input: TestDriveInput) {
  const [hour = Number.NaN, minute = Number.NaN] = input.time
    .split(":")
    .map(Number);
  if (
    hour < 8 ||
    hour > 18 ||
    (hour === 18 && minute > 0) ||
    minute % 30 !== 0
  ) {
    throw new Error("INVALID_SCHEDULE");
  }
  const scheduledAt = new Date(`${input.date}T${input.time}:00+07:00`);
  if (Number.isNaN(scheduledAt.getTime())) {
    throw new Error("INVALID_SCHEDULE");
  }

  const now = Date.now();
  const max = now + 90 * 24 * 60 * 60 * 1000;
  if (scheduledAt.getTime() <= now || scheduledAt.getTime() > max) {
    throw new Error("INVALID_SCHEDULE");
  }
  return scheduledAt;
}
