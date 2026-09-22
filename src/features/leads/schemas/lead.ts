import { z } from "zod";
import { normalizePhone } from "@/lib/utils";

export const leadSchema = z.object({
  name: z.string().trim().min(2, "Vui lòng nhập họ và tên.").max(80),
  phone: z
    .string()
    .transform(normalizePhone)
    .pipe(z.string().regex(/^0\d{9}$/, "Số điện thoại chưa đúng định dạng.")),
  email: z.union([z.literal(""), z.string().email("Email chưa đúng định dạng.")]).optional(),
  carId: z.string().max(80).optional(),
  brand: z.string().max(80).optional(),
  interestType: z.enum(["QUOTE", "TEST_DRIVE", "FINANCE", "CAR_SELECTION", "PROMOTION"]),
  preferredContactTime: z.string().min(1, "Vui lòng chọn thời gian liên hệ."),
  note: z.string().max(800).optional(),
  source: z.string().max(80).default("website"),
  landingPage: z.string().max(500).optional(),
  referrer: z.string().max(500).optional(),
  submissionKey: z.string().uuid(),
  website: z.string().max(0, "Yêu cầu không hợp lệ."),
  consent: z.literal("on", { errorMap: () => ({ message: "Bạn cần đồng ý để gửi yêu cầu." }) }),
});

export type LeadInput = z.infer<typeof leadSchema>;
