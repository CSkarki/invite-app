import { requireGuest } from "../../../../lib/guest-auth";
import { requireHost } from "../../../../lib/auth";
import { listPhotos, getSignedUrls } from "../../../../lib/supabase";

export async function GET(request) {
  // Allow both guest session and host session
  const guest = requireGuest(request);
  const host = requireHost(request);

  if (!guest.ok && !host.ok) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const files = await listPhotos();
    if (!files.length) {
      return Response.json([]);
    }

    const filenames = files.map((f) => f.name);
    const signed = await getSignedUrls(filenames);

    const photos = files.map((f, i) => ({
      name: f.name,
      url: signed[i]?.signedUrl || "",
      size: f.metadata?.size || 0,
      createdAt: f.created_at || "",
    }));

    return Response.json(photos);
  } catch (err) {
    console.error("Gallery photos error:", err.message);
    return Response.json({ error: "Failed to load photos" }, { status: 500 });
  }
}
