import { requireHost } from "../../../../lib/auth";
import { createAlbum, listAlbums } from "../../../../lib/gallery-store";

export async function GET(request) {
  const auth = requireHost(request);
  if (!auth.ok) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const albums = await listAlbums();
    return Response.json(albums);
  } catch (err) {
    console.error("List albums error:", err.message);
    return Response.json({ error: "Failed to list albums" }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = requireHost(request);
  if (!auth.ok) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await request.json();
  if (!name || typeof name !== "string" || !name.trim()) {
    return Response.json({ error: "Album name is required" }, { status: 400 });
  }
  if (name.trim().length > 100) {
    return Response.json({ error: "Album name too long" }, { status: 400 });
  }

  try {
    const album = await createAlbum(name);
    return Response.json(album, { status: 201 });
  } catch (err) {
    console.error("Create album error:", err.message);
    return Response.json({ error: "Failed to create album" }, { status: 500 });
  }
}
