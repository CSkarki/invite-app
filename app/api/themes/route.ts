import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { THEMES } from "@/lib/themes";

export async function GET(): Promise<Response> {
  const result = await requireUser();
  if (!result.ok) {
    return Response.json({ error: "Unauthorized" }, { status: result.status });
  }
  return NextResponse.json(THEMES, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
