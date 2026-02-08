import { createClient } from "@/lib/supabase/server";

export async function POST(): Promise<Response> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return Response.json({ ok: true });
}
