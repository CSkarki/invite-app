import { NextRequest } from "next/server";
import * as XLSX from "xlsx";
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
    const arr = rsvps.map((r) => ({
      timestamp: r.createdAt?.toISOString?.() ?? "",
      name: r.name ?? "",
      email: r.email ?? "",
      attending: r.attending ?? "",
      message: r.message ?? "",
    }));
    const head = ["Timestamp", "Name", "Email", "Attending", "Message"];
    const data = [head, ...arr.map((r) => [r.timestamp, r.name, r.email, r.attending, r.message || ""])];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "RSVPs");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as ArrayBuffer;
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="rsvps.xlsx"',
      },
    });
  } catch (err: unknown) {
    console.error("Export error:", err);
    return new Response("Export failed", { status: 500 });
  }
}
