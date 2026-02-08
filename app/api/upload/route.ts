import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { validateImageFile, uploadInviteImage } from "@/lib/storage";

export async function POST(request: NextRequest): Promise<Response> {
  const result = await requireUser();
  if (!result.ok) {
    return Response.json({ error: "Unauthorized" }, { status: result.status });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  const validation = validateImageFile(file);
  if (!validation.ok) {
    return Response.json({ error: validation.error }, { status: 400 });
  }

  try {
    const url = await uploadInviteImage(result.user.id, file);
    return Response.json({ url });
  } catch (err: unknown) {
    console.error("Upload error:", err);
    const message = err instanceof Error ? err.message : "Upload failed";
    return Response.json(
      { error: message },
      { status: 500 }
    );
  }
}
