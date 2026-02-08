import { getSession } from "@/lib/auth";

export async function GET(): Promise<Response> {
  const session = await getSession();
  if (!session?.user) {
    return Response.json({ ok: false }, { status: 401 });
  }
  return Response.json({ ok: true, user: session.user });
}
