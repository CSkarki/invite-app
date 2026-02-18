import { createClient } from "@supabase/supabase-js";

const BUCKET = "event-photos";
const SIGNED_URL_EXPIRY = 3600; // 1 hour in seconds

function getClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  }
  return createClient(url, key);
}

/** Upload a photo buffer to private storage. */
export async function uploadPhoto(buffer, filename, contentType) {
  const supabase = getClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, buffer, {
      contentType,
      upsert: false,
    });
  if (error) throw new Error(error.message);
  return data;
}

/** Delete a photo from storage. */
export async function deletePhoto(filename) {
  const supabase = getClient();
  const { error } = await supabase.storage.from(BUCKET).remove([filename]);
  if (error) throw new Error(error.message);
}

/** List all photos in the bucket. */
export async function listPhotos() {
  const supabase = getClient();
  const { data, error } = await supabase.storage.from(BUCKET).list("", {
    limit: 200,
    sortBy: { column: "created_at", order: "desc" },
  });
  if (error) throw new Error(error.message);
  // Filter out folder placeholders
  return (data || []).filter((f) => f.name && f.id);
}

/** Get signed URLs for an array of filenames. */
export async function getSignedUrls(filenames) {
  if (!filenames.length) return [];
  const supabase = getClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(filenames, SIGNED_URL_EXPIRY);
  if (error) throw new Error(error.message);
  return data || [];
}
