import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { signupSchema } from "@/lib/validations/auth";

export async function POST(request: NextRequest): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }
  const { email, password, name } = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: name ? { data: { display_name: name } } : undefined,
  });
  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
  return Response.json({ ok: true, user: data.user });
}
