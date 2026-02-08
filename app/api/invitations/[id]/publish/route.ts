import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(
  _request: NextRequest,
  { params }: RouteContext
): Promise<Response> {
  const { id } = await params;
  if (!id) {
    return Response.json({ error: "Missing invitation id" }, { status: 400 });
  }
  const result = await requireUser();
  if (!result.ok) {
    return Response.json({ error: "Unauthorized" }, { status: result.status });
  }
  try {
    const invitation = await prisma.invitation.findFirst({
      where: { id, userId: result.user.id },
    });
    if (!invitation) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    const updated = await prisma.invitation.update({
      where: { id },
      data: { published: true },
    });
    return Response.json(updated);
  } catch (err: unknown) {
    console.error("Publish error:", err);
    return Response.json({ error: "Failed to publish" }, { status: 500 });
  }
}
