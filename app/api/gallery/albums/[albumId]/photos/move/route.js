import { requireHost } from "../../../../../../../lib/auth";
import { getAlbum } from "../../../../../../../lib/gallery-store";
import {
  copyPhotoBetweenAlbums,
  movePhotoBetweenAlbums,
} from "../../../../../../../lib/supabase";

export async function POST(request, { params }) {
  const auth = requireHost(request);
  if (!auth.ok) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { albumId } = params;
  const { sourcePath, targetAlbumId, copy } = await request.json();

  if (!sourcePath || !targetAlbumId) {
    return Response.json({ error: "sourcePath and targetAlbumId are required" }, { status: 400 });
  }

  try {
    const sourceAlbum = await getAlbum(albumId);
    if (!sourceAlbum) {
      return Response.json({ error: "Source album not found" }, { status: 404 });
    }

    // Validate sourcePath belongs to source album
    if (!sourcePath.startsWith(`${sourceAlbum.slug}/`)) {
      return Response.json({ error: "Invalid source path" }, { status: 400 });
    }

    const targetAlbum = await getAlbum(targetAlbumId);
    if (!targetAlbum) {
      return Response.json({ error: "Target album not found" }, { status: 404 });
    }

    // Extract filename from source path
    const filename = sourcePath.split("/").pop();
    const newPath = `${targetAlbum.slug}/${filename}`;

    if (copy) {
      await copyPhotoBetweenAlbums(sourcePath, targetAlbum.slug, filename);
    } else {
      await movePhotoBetweenAlbums(sourcePath, targetAlbum.slug, filename);
    }

    return Response.json({ ok: true, newPath });
  } catch (err) {
    console.error("Move/copy error:", err.message);
    return Response.json({ error: "Operation failed: " + err.message }, { status: 500 });
  }
}
