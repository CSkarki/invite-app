import { NextRequest, NextResponse } from "next/server";
import { getDesignObjects } from "@/lib/design-objects";

export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const eventType = searchParams.get("eventType") || undefined;
  const objects = getDesignObjects(eventType);
  return NextResponse.json(objects, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
