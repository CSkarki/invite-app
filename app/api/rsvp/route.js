import { addRsvp } from "../../../lib/rsvp-store";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, email, attending, message } = body;
  if (!name || typeof name !== "string" || !email || typeof email !== "string" || !attending) {
    return Response.json(
      { error: "Name, email, and attending are required" },
      { status: 400 }
    );
  }

  try {
    await addRsvp({ name, email, attending, message });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("RSVP API error:", err.message);
    return Response.json(
      { error: err.message || "Failed to save RSVP" },
      { status: 500 }
    );
  }
}
