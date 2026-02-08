import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

/** List RSVPs for an invitation (owner only) */
export async function GET(
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
    const rsvps = await prisma.inviteRsvp.findMany({
      where: { invitationId: id },
      orderBy: { createdAt: "asc" },
    });
    const rows = rsvps.map((r) => ({
      id: r.id,
      timestamp: r.createdAt?.toISOString?.() ?? "",
      name: r.name ?? "",
      email: r.email ?? "",
      attending: r.attending ?? "",
      message: r.message ?? "",
    }));
    return Response.json(rows);
  } catch (err: unknown) {
    console.error("RSVPs list error:", err);
    return Response.json({ error: "Failed to load RSVPs" }, { status: 500 });
  }
}
