import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") return NextResponse.next();
  const token = request.cookies.get("aurelia.session")?.value;
  if (!token) return NextResponse.redirect(new URL("/admin/login", request.url));
  const rawSecret = process.env.SESSION_SECRET;
  if (!rawSecret) return NextResponse.redirect(new URL("/admin/login", request.url));
  try {
    await jwtVerify(token, new TextEncoder().encode(rawSecret));
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
}

export const config = { matcher: ["/admin/:path*"] };
