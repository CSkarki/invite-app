import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { rsvpSchema } from "@/lib/validations/rsvp";

export async function POST(request: NextRequest): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = rsvpSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }
  const { invitationId, name, email, attending, message } = parsed.data;

  try {
    const invitation = await prisma.invitation.findFirst({
      where: { id: invitationId.trim(), published: true },
    });
    if (!invitation) {
      return Response.json({ error: "Invitation not found or not published" }, { status: 404 });
    }
    await prisma.inviteRsvp.create({
      data: {
        invitationId: invitation.id,
        name: name.trim(),
        email: email ? email.trim() : "",
        attending,
        message: message ? message.trim() : "",
      },
    });
    return Response.json({ ok: true });
  } catch (err: unknown) {
    console.error("RSVP API error:", err);
    const errMessage = err instanceof Error ? err.message : "Failed to save RSVP";
    return Response.json({ error: errMessage }, { status: 500 });
  }
}
