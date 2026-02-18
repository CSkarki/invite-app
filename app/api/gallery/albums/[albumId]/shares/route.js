import { requireHost } from "../../../../../../lib/auth";
import {
  getAlbum,
  listAlbumShares,
  shareAlbumWithEmails,
  revokeAlbumShare,
} from "../../../../../../lib/gallery-store";

export async function GET(request, { params }) {
  const auth = requireHost(request);
  if (!auth.ok) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { albumId } = params;

  try {
    const album = await getAlbum(albumId);
    if (!album) {
      return Response.json({ error: "Album not found" }, { status: 404 });
    }
    const shares = await listAlbumShares(albumId);
    return Response.json(shares);
  } catch (err) {
    console.error("List shares error:", err.message);
    return Response.json({ error: "Failed to list shares" }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const auth = requireHost(request);
  if (!auth.ok) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { albumId } = params;
  const { emails } = await request.json();

  if (!Array.isArray(emails) || !emails.length) {
    return Response.json({ error: "emails array is required" }, { status: 400 });
  }

  try {
    const album = await getAlbum(albumId);
    if (!album) {
      return Response.json({ error: "Album not found" }, { status: 404 });
    }
    await shareAlbumWithEmails(albumId, emails);
    return Response.json({ ok: true, added: emails.length });
  } catch (err) {
    console.error("Share album error:", err.message);
    return Response.json({ error: "Failed to share album" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = requireHost(request);
  if (!auth.ok) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { albumId } = params;
  const { email } = await request.json();

  if (!email || typeof email !== "string") {
    return Response.json({ error: "email is required" }, { status: 400 });
  }

  try {
    await revokeAlbumShare(albumId, email);
    return Response.json({ ok: true });
  } catch (err) {
    console.error("Revoke share error:", err.message);
    return Response.json({ error: "Failed to revoke share" }, { status: 500 });
  }
}
