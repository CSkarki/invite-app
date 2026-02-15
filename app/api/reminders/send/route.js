import { requireHost } from "../../../../lib/auth";
import { Resend } from "resend";

export async function POST(request) {
  const auth = requireHost(request);
  if (!auth.ok) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { recipients, subject, message } = await request.json();

  if (!Array.isArray(recipients) || recipients.length === 0) {
    return Response.json({ error: "No recipients selected" }, { status: 400 });
  }
  if (!subject || !subject.trim()) {
    return Response.json({ error: "Subject is required" }, { status: 400 });
  }
  if (!message || !message.trim()) {
    return Response.json({ error: "Message is required" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Email service not configured" },
      { status: 500 }
    );
  }

  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  const results = [];
  for (const { name, email } of recipients) {
    const firstName = (name || "").split(" ")[0] || "Guest";
    try {
      await resend.emails.send({
        from,
        to: email,
        subject: subject.trim(),
        html: `<div style="font-family:sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;">
          <p>Hi ${firstName},</p>
          <p>${message.trim().replace(/\n/g, "<br>")}</p>
        </div>`,
      });
      results.push({ email, status: "sent" });
    } catch (err) {
      console.error(`Failed to send to ${email}:`, err.message);
      results.push({ email, status: "failed", error: err.message });
    }
  }

  const sent = results.filter((r) => r.status === "sent").length;
  const failed = results.filter((r) => r.status === "failed").length;

  return Response.json({ sent, failed, results });
}
