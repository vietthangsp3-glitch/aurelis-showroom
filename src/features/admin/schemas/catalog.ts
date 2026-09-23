import { z } from "zod";
import { isAllowedHttpsMediaUrl } from "@/lib/security/media-url";

const optionalText = (max: number) =>
  z.string().trim().max(max).optional().default("");
const requiredText = (max: number, message: string) =>
  z.string().trim().min(1, message).max(max);

const mediaUrlOrEmpty = z
  .string()
  .trim()
  .max(1000)
  .refine((value) => !value || isAllowedHttpsMediaUrl(value), {
    message: "URL phải dùng HTTPS và thuộc hostname media được cho phép.",
  });

const gallerySchema = z
  .string()
  .max(15000)
  .default("")
  .superRefine((value, ctx) => {
    const urls = value
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);

    if (urls.length > 20) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Tối đa 20 ảnh cho mỗi xe.",
      });
    }

    urls.forEach((url, index) => {
      if (!isAllowedHttpsMediaUrl(url)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Ảnh số ${index + 1} dùng URL hoặc hostname không được phép.`,
        });
      }
    });
  });

export const vehicleFormSchema = z
  .object({
    modelId: requiredText(80, "Vui lòng chọn dòng xe."),
    slug: requiredText(180, "Slug là bắt buộc."),
    year: z.coerce
      .number()
      .int()
      .min(1990)
      .max(new Date().getFullYear() + 2),
    bodyType: z.enum([
      "SUV",
      "Sedan",
      "Crossover",
      "MPV",
      "Hatchback",
      "Electric",
      "Luxury",
    ]),
    segment: requiredText(100, "Phân khúc là bắt buộc."),
    fuelType: z.enum(["Xăng", "Hybrid", "Điện", "Dầu"]),
    seats: z.coerce.number().int().min(1).max(9),
    description: optionalText(1200),
    exterior: optionalText(6000),
    interior: optionalText(6000),
    technology: optionalText(6000),
    safety: optionalText(6000),
    overviewTitle: optionalText(180),
    overviewQuote: optionalText(300),
    brochureUrl: mediaUrlOrEmpty,
    seoTitle: optionalText(180),
    seoDescription: optionalText(320),
    status: z.enum(["DRAFT", "PUBLISHED"]),
    variantName: requiredText(120, "Tên phiên bản là bắt buộc."),
    sku: requiredText(80, "SKU là bắt buộc.").regex(
      /^[A-Za-z0-9._-]+$/,
      "SKU chỉ gồm chữ, số, dấu chấm, gạch ngang hoặc gạch dưới.",
    ),
    price: z.coerce.number().finite().positive().max(100_000_000_000),
    salePrice: z
      .union([
        z.literal(""),
        z.coerce.number().finite().nonnegative().max(100_000_000_000),
      ])
      .optional()
      .default(""),
    engine: optionalText(160),
    horsepower: z.coerce.number().int().min(0).max(5000),
    torque: z.coerce.number().int().min(0).max(10000),
    acceleration: z.coerce.number().min(0).max(99),
    transmission: optionalText(160),
    drivetrain: optionalText(160),
    dimensions: optionalText(160),
    showroomId: optionalText(80),
    color: optionalText(100),
    quantity: z.coerce.number().int().min(0).max(10000),
    inventoryStatus: z.enum([
      "AVAILABLE",
      "LOW_STOCK",
      "PREORDER",
      "OUT_OF_STOCK",
    ]),
    coverImage: mediaUrlOrEmpty,
    galleryImages: gallerySchema,
    exteriorImage: mediaUrlOrEmpty,
    interiorImage: mediaUrlOrEmpty,
    technologyImage: mediaUrlOrEmpty,
    safetyImage: mediaUrlOrEmpty,
    displacement: optionalText(160),
    maxSpeed: optionalText(160),
    consumption: optionalText(160),
    wheelbase: optionalText(160),
    groundClearance: optionalText(160),
    curbWeight: optionalText(160),
    luggageCapacity: optionalText(160),
    energyCapacity: optionalText(160),
    centerScreen: optionalText(160),
    audio: optionalText(160),
    climate: optionalText(160),
    seatMaterial: optionalText(160),
    sunroof: optionalText(160),
    wirelessCharging: optionalText(160),
    connectivity: optionalText(160),
    ambientLighting: optionalText(160),
    driverAssist: optionalText(160),
    cruiseControl: optionalText(160),
    laneWarning: optionalText(160),
    laneKeepAssist: optionalText(160),
    blindSpot: optionalText(160),
    emergencyBrake: optionalText(160),
    camera: optionalText(160),
    sensors: optionalText(160),
    airbags: optionalText(160),
  })
  .superRefine((value, ctx) => {
    if (value.salePrice !== "" && value.salePrice > value.price) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["salePrice"],
        message: "Giá ưu đãi không được lớn hơn giá niêm yết.",
      });
    }

    if (!value.coverImage) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["coverImage"],
        message: "Cần ít nhất một ảnh đại diện hợp lệ.",
      });
    }
  });

export const brandFormSchema = z.object({
  name: requiredText(100, "Tên thương hiệu là bắt buộc."),
  slug: optionalText(120),
  logoUrl: mediaUrlOrEmpty.optional().default(""),
  description: optionalText(1200),
});

export const modelFormSchema = z.object({
  brandId: requiredText(80, "Vui lòng chọn thương hiệu."),
  name: requiredText(120, "Tên dòng xe là bắt buộc."),
  slug: optionalText(160),
});

export type VehicleFormInput = z.infer<typeof vehicleFormSchema>;

export function parseVehicleForm(formData: FormData) {
  return vehicleFormSchema.safeParse(Object.fromEntries(formData.entries()));
}

export function firstVehicleFormError(
  result: z.SafeParseError<VehicleFormInput>,
) {
  return result.error.issues[0]?.message ?? "Dữ liệu xe chưa hợp lệ.";
}
