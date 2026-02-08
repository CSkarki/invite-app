import { createClient } from "./supabase/server";
import type { Session, AuthResult } from "@/types";

/**
 * Get current session (Supabase Auth). Use in Server Components and API routes.
 * Uses getUser() for server-side auth (validates with Supabase Auth server).
 */
export async function getSession(): Promise<Session | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return { user };
}

/**
 * Require authenticated user. Returns { ok: true, user } or { ok: false, status }.
 */
export async function requireUser(): Promise<AuthResult> {
  const session = await getSession();
  if (!session?.user) {
    return { ok: false, status: 401 };
  }
  return { ok: true, user: session.user };
}
