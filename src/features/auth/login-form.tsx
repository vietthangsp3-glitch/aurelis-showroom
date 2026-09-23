"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    login,
    {},
  );
  return (
    <form action={action} className="login-form">
      <label>
        Email quản trị
        <input name="email" type="email" autoComplete="username" required />
      </label>
      <label>
        Mật khẩu
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </label>
      <label>
        Mã xác thực 2 bước
        <input
          name="mfaCode"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          placeholder="6 chữ số (nếu MFA được bật)"
        />
      </label>
      {state.error && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Đang đăng nhập..." : "Đăng nhập"}
      </Button>
    </form>
  );
}
