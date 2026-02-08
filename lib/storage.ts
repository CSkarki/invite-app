import { createClient } from "./supabase/server";
import type { ValidationResult } from "@/types";

const BUCKET = "invite-images";
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function validateImageFile(file: File): ValidationResult {
  if (!file || typeof file.size !== "number") {
    return { ok: false, error: "Invalid file" };
  }
  if (file.size > MAX_SIZE_BYTES) {
    return { ok: false, error: "File too large (max 5 MB)" };
  }
  const type = file.type?.toLowerCase();
  if (!type || !ALLOWED_TYPES.includes(type)) {
    return { ok: false, error: "Only JPG, PNG, and WebP are allowed" };
  }
  return { ok: true };
}

export async function uploadInviteImage(userId: string, file: File): Promise<string> {
  const supabase = await createClient();
  const ext = file.name?.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = ["jpeg", "jpg", "png", "webp"].includes(ext) ? ext : "jpg";
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${safeExt}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error("Storage upload error:", error);
    throw new Error(error.message || "Upload failed");
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
  return urlData.publicUrl;
}
