-- RLS policies for invite-images bucket so uploads work and public invite pages can load images.
-- Run in Supabase SQL Editor. Create the bucket "invite-images" first (Storage → New bucket → name: invite-images, Public: on).

-- Allow authenticated users to upload only to their own folder (path prefix = auth.uid())
create policy "Users can upload to own folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'invite-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read so invite pages can display images (bucket is public)
create policy "Public can read invite images"
on storage.objects for select
to public
using (bucket_id = 'invite-images');
