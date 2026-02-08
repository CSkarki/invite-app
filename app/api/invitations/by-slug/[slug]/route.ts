import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

type RouteContext = { params: Promise<{ slug: string }> };

/** Public: get published invitation by slug for /i/[slug] */
export async function GET(
  _request: NextRequest,
  { params }: RouteContext
): Promise<Response> {
  const { slug } = await params;
  if (!slug) {
    return Response.json({ error: "Missing slug" }, { status: 400 });
  }
  try {
    const invitation = await prisma.invitation.findFirst({
      where: { slug: String(slug).toLowerCase(), published: true },
    });
    if (!invitation) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    return Response.json(invitation);
  } catch (err: unknown) {
    console.error("Invitation by slug error:", err);
    return Response.json({ error: "Failed to load invitation" }, { status: 500 });
  }
}
