import { NextResponse } from "next/server";
import { DESIGN_TEMPLATES } from "@/lib/design-templates";

export async function GET(): Promise<Response> {
  return NextResponse.json(DESIGN_TEMPLATES, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
