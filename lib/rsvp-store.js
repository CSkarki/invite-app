import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import pg from "pg";

const { Client } = pg;

// Supabase uses certs Node may not trust. Use parsed config so ssl is not overridden by URL.
function dbConfig(url) {
  try {
    const u = new URL(url);
    const user = u.username ? decodeURIComponent(u.username) : undefined;
    const password = u.password ? decodeURIComponent(u.password) : undefined;
    return {
      host: u.hostname,
      port: u.port || 5432,
      user,
      password,
      database: u.pathname?.slice(1) || undefined,
      ssl: { rejectUnauthorized: false },
    };
  } catch (_) {
    return { connectionString: url, ssl: { rejectUnauthorized: false } };
  }
}

const DATA_DIR = process.env.VERCEL ? "/tmp/data" : join(process.cwd(), "data");
const RSVPS_FILE = join(DATA_DIR, "rsvps.json");

function fileGetRsvps() {
  if (!existsSync(RSVPS_FILE)) return [];
  try {
    const raw = readFileSync(RSVPS_FILE, "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function fileSaveRsvps(rows) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(RSVPS_FILE, JSON.stringify(rows, null, 2), "utf8");
}

/** List RSVPs. Each row: { timestamp, name, email, attending, message }. */
export async function listRsvps() {
  const url = process.env.DATABASE_URL;
  if (url) {
    const client = new Client(dbConfig(url));
    try {
      await client.connect();
      const res = await client.query(
        "select id, created_at, name, email, attending, message from invite_rsvps order by created_at asc"
      );
      return (res.rows || []).map((r) => ({
        timestamp: r.created_at ? new Date(r.created_at).toISOString() : "",
        name: r.name ?? "",
        email: r.email ?? "",
        attending: r.attending ?? "",
        message: r.message ?? "",
      }));
    } finally {
      await client.end();
    }
  }
  return fileGetRsvps();
}

/** Add one RSVP. */
export async function addRsvp({ name, email, attending, message }) {
  const url = process.env.DATABASE_URL;
  if (url) {
    const client = new Client(dbConfig(url));
    try {
      await client.connect();
      await client.query(
        "insert into invite_rsvps (name, email, attending, message) values ($1, $2, $3, $4)",
        [
          String(name).trim(),
          String(email).trim(),
          String(attending).trim(),
          message != null ? String(message).trim() : "",
        ]
      );
      return;
    } finally {
      await client.end();
    }
  }
  const rows = fileGetRsvps();
  rows.push({
    timestamp: new Date().toISOString(),
    name: String(name).trim(),
    email: String(email).trim(),
    attending: String(attending).trim(),
    message: message != null ? String(message).trim() : "",
  });
  fileSaveRsvps(rows);
}
