import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const issuer = "aurelia";
const audience = "aurelia-admin";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") return NextResponse.next();

  const token = request.cookies.get("aurelia.session")?.value;
  const rawSecret = process.env.SESSION_SECRET;

  if (!token || !rawSecret || rawSecret.length < 32) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(rawSecret), {
      issuer,
      audience,
    });
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
}

export const config = { matcher: ["/admin/:path*"] };
