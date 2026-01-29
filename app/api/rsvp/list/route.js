import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { requireHost } from "../../../../lib/auth";

const DATA_DIR = process.env.VERCEL ? "/tmp/data" : join(process.cwd(), "data");
const RSVPS_FILE = join(DATA_DIR, "rsvps.json");

export async function GET(request) {
  const result = requireHost(request);
  if (!result.ok) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    if (!existsSync(RSVPS_FILE)) {
      return Response.json([]);
    }
    const raw = readFileSync(RSVPS_FILE, "utf8");
    const data = JSON.parse(raw);
    return Response.json(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("RSVP list error:", err.message);
    return Response.json({ error: "Failed to load RSVPs" }, { status: 500 });
  }
}
