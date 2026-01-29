import { requireHost } from "../../../../lib/auth";

export async function GET(request) {
  const result = requireHost(request);
  if (!result.ok) {
    return Response.json({ ok: false }, { status: 401 });
  }
  return Response.json({ ok: true });
}
