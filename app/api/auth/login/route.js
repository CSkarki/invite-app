import { validateHostCredentials, createSessionCookie } from "../../../../lib/auth";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { username, password } = body;
  if (!validateHostCredentials(username, password)) {
    return Response.json({ error: "Invalid username or password" }, { status: 401 });
  }
  const { name, value, options } = createSessionCookie();
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `${name}=${value}; ${options}`,
    },
  });
}
