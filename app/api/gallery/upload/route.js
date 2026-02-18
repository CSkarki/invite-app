import { requireHost } from "../../../../lib/auth";
import { uploadPhoto } from "../../../../lib/supabase";

export async function POST(request) {
  const auth = requireHost(request);
  if (!auth.ok) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll("photos");

    if (!files.length) {
      return Response.json({ error: "No files uploaded" }, { status: 400 });
    }

    const results = [];
    for (const file of files) {
      if (!(file instanceof File)) continue;
      if (!file.type.startsWith("image/")) {
        results.push({ name: file.name, status: "skipped", error: "Not an image" });
        continue;
      }

      // Generate unique filename to avoid collisions
      const ext = file.name.split(".").pop() || "jpg";
      const timestamp = Date.now();
      const rand = Math.random().toString(36).slice(2, 8);
      const filename = `${timestamp}-${rand}.${ext}`;

      const buffer = Buffer.from(await file.arrayBuffer());
      await uploadPhoto(buffer, filename, file.type);
      results.push({ name: filename, originalName: file.name, status: "uploaded" });
    }

    const uploaded = results.filter((r) => r.status === "uploaded").length;
    return Response.json({ uploaded, results });
  } catch (err) {
    console.error("Upload error:", err.message);
    return Response.json({ error: "Upload failed: " + err.message }, { status: 500 });
  }
}
