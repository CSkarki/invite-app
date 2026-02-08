import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest): Promise<Response> {
  const result = await requireUser();
  if (!result.ok) {
    return new Response("Unauthorized", { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const invitationId = searchParams.get("invitation_id");
  if (!invitationId) {
    return new Response("invitation_id required", { status: 400 });
  }
  try {
    const invitation = await prisma.invitation.findFirst({
      where: { id: invitationId, userId: result.user.id },
    });
    if (!invitation) {
      return new Response("Not found", { status: 404 });
    }
    const rsvps = await prisma.inviteRsvp.findMany({
      where: { invitationId: invitation.id },
      orderBy: { createdAt: "asc" },
    });
    const rows = rsvps.map((r) => ({
      timestamp: r.createdAt?.toISOString?.() ?? "",
      name: r.name ?? "",
      email: r.email ?? "",
      attending: r.attending ?? "",
      message: r.message ?? "",
    }));
    const raw = JSON.stringify(rows, null, 2);
    return new Response(raw, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": 'attachment; filename="rsvps.json"',
      },
    });
  } catch (err: unknown) {
    console.error("Export JSON error:", err);
    return new Response("Export failed", { status: 500 });
  }
}
