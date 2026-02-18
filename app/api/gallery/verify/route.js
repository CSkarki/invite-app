import pg from "pg";
import { createGuestSession } from "../../../../lib/guest-auth";
import { sendEmail } from "../../../../lib/mailer";
import { createHmac } from "crypto";

const { Client } = pg;

// In-memory OTP store: { email -> { code, expiresAt, attempts } }
// In production, use Redis or a database table. This works for single-instance deploys.
const otpStore = new Map();

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

function generateOTP() {
  // Cryptographically random 6-digit code
  const bytes = Buffer.alloc(4);
  require("crypto").randomFillSync(bytes);
  const num = bytes.readUInt32BE(0) % 1000000;
  return String(num).padStart(6, "0");
}

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

/** Step 1: POST { email } → sends OTP */
/** Step 2: POST { email, code } → verifies OTP and sets session */
export async function POST(request) {
  const body = await request.json();
  const { email, code } = body;

  if (!email || typeof email !== "string" || !email.trim()) {
    return Response.json({ error: "Email is required" }, { status: 400 });
  }

  const trimmed = email.trim().toLowerCase();
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    return Response.json({ error: "Database not configured" }, { status: 500 });
  }

  // Check email exists in RSVP list
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

  // Step 2: Verify OTP code
  if (code) {
    const stored = otpStore.get(trimmed);
    if (!stored) {
      return Response.json({ error: "No code sent. Request a new one." }, { status: 400 });
    }
    if (Date.now() > stored.expiresAt) {
      otpStore.delete(trimmed);
      return Response.json({ error: "Code expired. Request a new one." }, { status: 400 });
    }
    if (stored.attempts >= MAX_ATTEMPTS) {
      otpStore.delete(trimmed);
      return Response.json({ error: "Too many attempts. Request a new code." }, { status: 429 });
    }

    stored.attempts++;

    if (String(code).trim() !== stored.code) {
      return Response.json(
        { error: `Invalid code. ${MAX_ATTEMPTS - stored.attempts} attempts remaining.` },
        { status: 400 }
      );
    }

    // OTP valid — clean up and issue session
    otpStore.delete(trimmed);
    const session = createGuestSession(trimmed);
    return new Response(JSON.stringify({ ok: true, verified: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": `${session.name}=${session.value}; ${session.options}`,
      },
    });
  }

  // Step 1: Generate and send OTP
  const otp = generateOTP();
  otpStore.set(trimmed, {
    code: otp,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
    attempts: 0,
  });

  try {
    await sendEmail({
      to: trimmed,
      subject: "Your Gallery Access Code",
      html: `<div style="font-family:sans-serif;line-height:1.6;color:#333;max-width:400px;margin:0 auto;padding:20px;text-align:center;">
        <h2 style="margin-bottom:8px;">Gallery Access Code</h2>
        <p style="color:#666;margin-bottom:24px;">Use this code to view event photos</p>
        <div style="font-size:32px;font-weight:bold;letter-spacing:8px;background:#f5f5f5;padding:16px;border-radius:8px;margin-bottom:24px;">${otp}</div>
        <p style="font-size:14px;color:#999;">This code expires in 10 minutes.</p>
      </div>`,
    });
  } catch (err) {
    console.error("Failed to send OTP:", err.message);
    otpStore.delete(trimmed);
    return Response.json({ error: "Failed to send verification code." }, { status: 500 });
  }

  return Response.json({ ok: true, codeSent: true });
}
