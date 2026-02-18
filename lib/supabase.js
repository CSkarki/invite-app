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

// ---- Folder-aware helpers ----

/** Upload a photo to a specific album slug folder. */
export async function uploadPhotoToAlbum(buffer, albumSlug, filename, contentType) {
  const path = `${albumSlug}/${filename}`;
  const supabase = getClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType, upsert: false });
  if (error) throw new Error(error.message);
  return data;
}

/** List all photos in a specific album slug folder. */
export async function listPhotosInAlbum(albumSlug) {
  const supabase = getClient();
  const { data, error } = await supabase.storage.from(BUCKET).list(albumSlug, {
    limit: 500,
    sortBy: { column: "created_at", order: "desc" },
  });
  if (error) throw new Error(error.message);
  return (data || [])
    .filter((f) => f.name && f.id)
    .map((f) => ({ ...f, path: `${albumSlug}/${f.name}` }));
}

/** Get signed URLs for full storage paths (e.g. "slug/file.jpg"). */
export async function getSignedUrlsForPaths(paths) {
  if (!paths.length) return [];
  const supabase = getClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(paths, SIGNED_URL_EXPIRY);
  if (error) throw new Error(error.message);
  return data || [];
}

/** Delete a photo by its full path (slug/filename). */
export async function deletePhotoByPath(path) {
  const supabase = getClient();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw new Error(error.message);
}

/** Copy a photo from one album to another (download + re-upload). */
export async function copyPhotoBetweenAlbums(sourcePath, targetSlug, targetFilename) {
  const supabase = getClient();
  const { data, error } = await supabase.storage.from(BUCKET).download(sourcePath);
  if (error) throw new Error(error.message);
  const buffer = Buffer.from(await data.arrayBuffer());
  const contentType = data.type || "image/jpeg";
  return uploadPhotoToAlbum(buffer, targetSlug, targetFilename, contentType);
}

/** Move a photo: copy then delete source. */
export async function movePhotoBetweenAlbums(sourcePath, targetSlug, targetFilename) {
  await copyPhotoBetweenAlbums(sourcePath, targetSlug, targetFilename);
  await deletePhotoByPath(sourcePath);
}
