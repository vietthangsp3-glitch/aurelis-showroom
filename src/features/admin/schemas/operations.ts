import { z } from "zod";

export const publishStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
export const bookingStatusSchema = z.enum([
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
]);

export const promotionFormSchema = z.object({
  title: z.string().trim().min(2).max(180),
  description: z.string().trim().min(5).max(3000),
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
});

export const articleFormSchema = z.object({
  title: z.string().trim().min(3).max(180),
  excerpt: z.string().trim().min(10).max(600),
  content: z.string().trim().min(20).max(60_000),
});

export const showroomFormSchema = z.object({
  name: z.string().trim().min(2).max(120),
  address: z.string().trim().min(5).max(300),
  city: z.string().trim().min(2).max(100),
  phone: z
    .string()
    .trim()
    .regex(/^[+()\d\s.-]{8,24}$/),
  openingHours: z.string().trim().min(3).max(160),
});
