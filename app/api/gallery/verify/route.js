import pg from "pg";
import { createGuestSession } from "../../../../lib/guest-auth";

const { Client } = pg;

function dbConfig(url) {
  try {
    const u = new URL(url);
    return {
      host: u.hostname,
      port: u.port || 5432,
      user: u.username ? decodeURIComponent(u.username) : undefined,
      password: u.password ? decodeURIComponent(u.password) : undefined,
      database: u.pathname?.slice(1) || undefined,
      ssl: { rejectUnauthorized: false },
    };
  } catch {
    return { connectionString: url, ssl: { rejectUnauthorized: false } };
  }
}

export async function POST(request) {
  const { email } = await request.json();

  if (!email || typeof email !== "string" || !email.trim()) {
    return Response.json({ error: "Email is required" }, { status: 400 });
  }

  const trimmed = email.trim().toLowerCase();
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    return Response.json({ error: "Database not configured" }, { status: 500 });
  }

  const client = new Client(dbConfig(dbUrl));
  try {
    await client.connect();
    const res = await client.query(
      "SELECT email FROM invite_rsvps WHERE LOWER(email) = $1 AND LOWER(attending) = 'yes' LIMIT 1",
      [trimmed]
    );

    if (!res.rows.length) {
      return Response.json(
        { error: "Email not found. Only guests who RSVP'd Yes can view photos." },
        { status: 403 }
      );
    }
  } finally {
    await client.end();
  }

  const session = createGuestSession(trimmed);
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `${session.name}=${session.value}; ${session.options}`,
    },
  });
}
