import { requireHost } from "../../../../lib/auth";
import { listRsvps } from "../../../../lib/rsvp-store";

export async function GET(request) {
  const result = requireHost(request);
  if (!result.ok) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const rows = await listRsvps();
    return Response.json(rows);
  } catch (err) {
    console.error("RSVP list error:", err.message);
    return Response.json({ error: "Failed to load RSVPs" }, { status: 500 });
  }
}
