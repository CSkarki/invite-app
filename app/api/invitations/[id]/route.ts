import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

type RouteContext = { params: Promise<{ id: string }> };

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
    return Response.json(invitation);
  } catch (err: unknown) {
    console.error("Invitation get error:", err);
    return Response.json({ error: "Failed to load invitation" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
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
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  try {
    const invitation = await prisma.invitation.findFirst({
      where: { id, userId: result.user.id },
    });
    if (!invitation) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    const data: Record<string, unknown> = {};
    if (typeof body.eventName === "string") data.eventName = (body.eventName as string).trim();
    if (body.eventDate !== undefined) data.eventDate = body.eventDate ? new Date(body.eventDate as string) : null;
    if (typeof body.eventTime === "string") data.eventTime = (body.eventTime as string).trim();
    if (typeof body.locationOrLink === "string") data.locationOrLink = (body.locationOrLink as string).trim() || null;
    if (typeof body.message === "string") data.message = (body.message as string).trim() || null;
    if (typeof body.imageUrl === "string") data.imageUrl = (body.imageUrl as string).trim() || null;
    if (typeof body.published === "boolean") data.published = body.published;
    if (typeof body.slug === "string" && (body.slug as string).trim()) data.slug = (body.slug as string).trim().toLowerCase();
    if (typeof body.themeId === "string") data.themeId = (body.themeId as string).trim() || null;
    if (body.themeConfig !== undefined) data.themeConfig = body.themeConfig && typeof body.themeConfig === "object" ? body.themeConfig as Prisma.InputJsonValue : Prisma.JsonNull;
    if (result.user?.user_metadata?.plan) data.ownerPlan = result.user.user_metadata.plan;

    const updated = await prisma.invitation.update({
      where: { id },
      data,
    });
    return Response.json(updated);
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
      return Response.json({ error: "Slug already in use" }, { status: 409 });
    }
    console.error("Invitation update error:", err);
    return Response.json({ error: "Failed to update invitation" }, { status: 500 });
  }
}

export async function DELETE(
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
    await prisma.invitation.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (err: unknown) {
    console.error("Invitation delete error:", err);
    return Response.json({ error: "Failed to delete invitation" }, { status: 500 });
  }
}
