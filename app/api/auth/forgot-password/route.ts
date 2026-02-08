import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest): Promise<Response> {
  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { email } = body;
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return Response.json({ error: "Valid email required" }, { status: 400 });
  }

  const supabase = await createClient();
  const origin = request.headers.get("origin") || request.nextUrl?.origin || "";
  const redirectTo = `${origin}/reset-password`;

  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo,
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
  return Response.json({ ok: true });
}
