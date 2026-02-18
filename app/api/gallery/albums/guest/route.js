import { requireGuest } from "../../../../../lib/guest-auth";
import { listAlbumsForEmail } from "../../../../../lib/gallery-store";

export async function GET(request) {
  const guest = requireGuest(request);
  if (!guest.ok) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const albums = await listAlbumsForEmail(guest.email);
    return Response.json(albums);
  } catch (err) {
    console.error("Guest albums error:", err.message);
    return Response.json({ error: "Failed to load albums" }, { status: 500 });
  }
}
