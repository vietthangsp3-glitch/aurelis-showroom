import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.brand.count();
    return NextResponse.json(
      { status: "ok", timestamp: new Date().toISOString() },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { status: "degraded", timestamp: new Date().toISOString() },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
