"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className="login-form">
      <label>Email quản trị<input name="email" type="email" autoComplete="username" required /></label>
      <label>Mật khẩu<input name="password" type="password" autoComplete="current-password" required /></label>
      {state.error && <p className="form-error" role="alert">{state.error}</p>}
      <Button type="submit" size="lg" disabled={pending}>{pending ? "Đang đăng nhập..." : "Đăng nhập"}</Button>
    </form>
  );
}
