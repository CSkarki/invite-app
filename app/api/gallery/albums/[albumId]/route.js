import { requireHost } from "../../../../../lib/auth";
import {
  getAlbum,
  renameAlbum,
  deleteAlbumRecord,
} from "../../../../../lib/gallery-store";
import {
  listPhotosInAlbum,
  deletePhotoByPath,
} from "../../../../../lib/supabase";

export async function PATCH(request, { params }) {
  const auth = requireHost(request);
  if (!auth.ok) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { albumId } = params;
  const { name } = await request.json();

  if (!name || typeof name !== "string" || !name.trim()) {
    return Response.json({ error: "Album name is required" }, { status: 400 });
  }

  try {
    const album = await getAlbum(albumId);
    if (!album) {
      return Response.json({ error: "Album not found" }, { status: 404 });
    }
    await renameAlbum(albumId, name);
    return Response.json({ ok: true });
  } catch (err) {
    console.error("Rename album error:", err.message);
    return Response.json({ error: "Failed to rename album" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
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

    // Delete all storage files in this album
    const files = await listPhotosInAlbum(album.slug);
    for (const file of files) {
      await deletePhotoByPath(file.path);
    }

    // Delete DB record (CASCADE removes shares)
    await deleteAlbumRecord(albumId);

    return Response.json({ ok: true, deletedPhotos: files.length });
  } catch (err) {
    console.error("Delete album error:", err.message);
    return Response.json({ error: "Failed to delete album" }, { status: 500 });
  }
}
