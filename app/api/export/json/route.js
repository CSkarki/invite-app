import { requireHost } from "../../../../lib/auth";
import { listRsvps } from "../../../../lib/rsvp-store";

export async function GET(request) {
  const result = requireHost(request);
  if (!result.ok) {
    return new Response("Unauthorized", { status: 401 });
  }
  try {
    const rows = await listRsvps();
    const raw = JSON.stringify(rows, null, 2);
    return new Response(raw, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": 'attachment; filename="rsvps.json"',
      },
    });
  } catch (err) {
    console.error("Export JSON error:", err.message);
    return new Response("Export failed", { status: 500 });
  }
}
