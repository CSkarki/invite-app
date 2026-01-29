import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { requireHost } from "../../../../lib/auth";

const RSVPS_FILE = process.env.VERCEL
  ? join("/tmp", "data", "rsvps.json")
  : join(process.cwd(), "data", "rsvps.json");

export async function GET(request) {
  const result = requireHost(request);
  if (!result.ok) {
    return new Response("Unauthorized", { status: 401 });
  }
  try {
    const raw = existsSync(RSVPS_FILE)
      ? readFileSync(RSVPS_FILE, "utf8")
      : "[]";
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
