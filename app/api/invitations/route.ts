import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { createInvitationSchema } from "@/lib/validations/invitation";

export async function GET(): Promise<Response> {
  const result = await requireUser();
  if (!result.ok) {
    return Response.json({ error: "Unauthorized" }, { status: result.status });
  }
  try {
    const invitations = await prisma.invitation.findMany({
      where: { userId: result.user.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        slug: true,
        eventName: true,
        eventDate: true,
        published: true,
        createdAt: true,
        _count: { select: { rsvps: true } },
      },
    });
    return Response.json(invitations);
  } catch (err: unknown) {
    console.error("Invitations list error:", err);
    return Response.json({ error: "Failed to load invitations" }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  const result = await requireUser();
  if (!result.ok) {
    return Response.json({ error: "Unauthorized" }, { status: result.status });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = createInvitationSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }
  const {
    eventName,
    eventDate,
    eventTime,
    locationOrLink,
    message,
    imageUrl,
    slug: inputSlug,
    themeId,
    themeConfig,
  } = parsed.data;

  const slug =
    (inputSlug && inputSlug.trim()) ||
    slugify(eventName) + "-" + Math.random().toString(36).slice(2, 10);

  const ownerPlan = result.user?.user_metadata?.plan ?? "free";
  try {
    const invitation = await prisma.invitation.create({
      data: {
        userId: result.user.id,
        slug: slug.trim().toLowerCase(),
        eventName,
        eventDate: eventDate ? new Date(eventDate) : null,
        eventTime: eventTime || null,
        locationOrLink: locationOrLink || null,
        message: message || null,
        imageUrl: imageUrl || null,
        themeId: themeId || null,
        themeConfig: themeConfig ? (themeConfig as Prisma.InputJsonValue) : Prisma.JsonNull,
        ownerPlan,
      },
    });
    return Response.json(invitation);
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
      return Response.json({ error: "Slug already in use" }, { status: 409 });
    }
    console.error("Invitation create error:", err);
    return Response.json({ error: "Failed to create invitation" }, { status: 500 });
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
