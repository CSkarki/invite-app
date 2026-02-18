import { requireHost } from "../../../../lib/auth";
import { deletePhoto } from "../../../../lib/supabase";

export async function POST(request) {
  const auth = requireHost(request);
  if (!auth.ok) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { filename } = await request.json();

  if (!filename || typeof filename !== "string") {
    return Response.json({ error: "Filename is required" }, { status: 400 });
  }

  try {
    await deletePhoto(filename);
    return Response.json({ ok: true });
  } catch (err) {
    console.error("Delete error:", err.message);
    return Response.json({ error: "Delete failed: " + err.message }, { status: 500 });
  }
}
