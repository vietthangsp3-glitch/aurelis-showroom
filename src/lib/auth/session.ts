import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type AppRole = "ADMIN" | "EDITOR" | "SALES";

export interface AppSession {
  userId: string;
  name: string;
  email: string;
  role: AppRole;
}

const cookieName = "aurelia.session";

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) {
    if (process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET chưa được cấu hình an toàn.");
    return new TextEncoder().encode("development-only-secret-change-me-now");
  }
  return new TextEncoder().encode(value);
}

export async function createSession(session: AppSession) {
  const token = await new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret());
  const cookieStore = await cookies();
  cookieStore.set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(cookieName);
}

export async function getSession(): Promise<AppSession | null> {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (
      typeof payload.userId !== "string" ||
      typeof payload.name !== "string" ||
      typeof payload.email !== "string" ||
      !["ADMIN", "EDITOR", "SALES"].includes(String(payload.role))
    ) return null;
    return payload as unknown as AppSession;
  } catch {
    return null;
  }
}

export async function requireRole(roles: AppRole[]) {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!roles.includes(session.role)) redirect("/admin/dashboard?error=forbidden");
  return session;
}
