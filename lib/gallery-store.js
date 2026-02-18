import pg from "pg";

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

function makeSlug(name) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${base}-${rand}`;
}

async function withClient(fn) {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not configured");
  const client = new Client(dbConfig(url));
  try {
    await client.connect();
    return await fn(client);
  } finally {
    await client.end();
  }
}

// ---- Albums ----

export async function createAlbum(name) {
  const slug = makeSlug(name);
  return withClient(async (client) => {
    const res = await client.query(
      "INSERT INTO gallery_albums (name, slug) VALUES ($1, $2) RETURNING *",
      [name.trim(), slug]
    );
    return res.rows[0];
  });
}

export async function listAlbums() {
  return withClient(async (client) => {
    const res = await client.query(`
      SELECT ga.*, COUNT(DISTINCT gas.email) AS share_count
      FROM gallery_albums ga
      LEFT JOIN gallery_album_shares gas ON gas.album_id = ga.id
      GROUP BY ga.id
      ORDER BY ga.created_at ASC
    `);
    return res.rows.map((r) => ({
      ...r,
      share_count: parseInt(r.share_count, 10) || 0,
    }));
  });
}

export async function listAlbumsForEmail(email) {
  return withClient(async (client) => {
    const res = await client.query(
      `SELECT ga.* FROM gallery_albums ga
       JOIN gallery_album_shares gas ON gas.album_id = ga.id
       WHERE LOWER(gas.email) = $1
       ORDER BY ga.created_at ASC`,
      [email.toLowerCase()]
    );
    return res.rows;
  });
}

export async function getAlbum(albumId) {
  return withClient(async (client) => {
    const res = await client.query(
      "SELECT * FROM gallery_albums WHERE id = $1",
      [albumId]
    );
    return res.rows[0] || null;
  });
}

export async function renameAlbum(albumId, newName) {
  return withClient(async (client) => {
    await client.query(
      "UPDATE gallery_albums SET name = $1 WHERE id = $2",
      [newName.trim(), albumId]
    );
  });
}

export async function deleteAlbumRecord(albumId) {
  return withClient(async (client) => {
    await client.query("DELETE FROM gallery_albums WHERE id = $1", [albumId]);
  });
}

// ---- Shares ----

export async function shareAlbumWithEmails(albumId, emails) {
  if (!emails.length) return;
  return withClient(async (client) => {
    const values = emails.map((_, i) => `($1, $${i + 2})`).join(", ");
    const params = [albumId, ...emails.map((e) => e.toLowerCase().trim())];
    await client.query(
      `INSERT INTO gallery_album_shares (album_id, email) VALUES ${values}
       ON CONFLICT (album_id, email) DO NOTHING`,
      params
    );
  });
}

export async function revokeAlbumShare(albumId, email) {
  return withClient(async (client) => {
    await client.query(
      "DELETE FROM gallery_album_shares WHERE album_id = $1 AND LOWER(email) = $2",
      [albumId, email.toLowerCase().trim()]
    );
  });
}

export async function listAlbumShares(albumId) {
  return withClient(async (client) => {
    const res = await client.query(
      "SELECT email, granted_at FROM gallery_album_shares WHERE album_id = $1 ORDER BY granted_at ASC",
      [albumId]
    );
    return res.rows;
  });
}
