"use server";

import { compare } from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSession, destroySession } from "@/lib/auth/session";

export interface LoginState { error?: string }

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: "Email hoặc mật khẩu chưa hợp lệ." };
  const expectedEmail = process.env.ADMIN_EMAIL;
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!expectedEmail || !hash) return { error: "Tài khoản quản trị chưa được cấu hình." };
  const valid = parsed.data.email.toLowerCase() === expectedEmail.toLowerCase() && (await compare(parsed.data.password, hash));
  if (!valid) return { error: "Email hoặc mật khẩu không chính xác." };
  await createSession({ userId: "env-admin", name: "Nguyễn Văn A", email: expectedEmail, role: "ADMIN" });
  redirect("/admin/dashboard");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}
