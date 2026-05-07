-- Run this only if authenticated image uploads fail.
-- يشدد القراءة العامة، ويسمح فقط للمستخدمين المسجلين بالرفع/التعديل/الحذف داخل bucket باجوزون.

update storage.buckets
set
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = array[
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/gif',
    'application/pdf',
    'video/mp4'
  ]
where id = 'bajozone-media';

drop policy if exists "Public can read BajoZone media" on storage.objects;
create policy "Public can read BajoZone media"
on storage.objects for select
using (bucket_id = 'bajozone-media');

drop policy if exists "Authenticated can upload BajoZone media" on storage.objects;
create policy "Authenticated can upload BajoZone media"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'bajozone-media'
  and auth.role() = 'authenticated'
);

drop policy if exists "Authenticated can update BajoZone media" on storage.objects;
create policy "Authenticated can update BajoZone media"
on storage.objects for update
to authenticated
using (
  bucket_id = 'bajozone-media'
  and auth.role() = 'authenticated'
)
with check (
  bucket_id = 'bajozone-media'
  and auth.role() = 'authenticated'
);

drop policy if exists "Authenticated can delete BajoZone media" on storage.objects;
create policy "Authenticated can delete BajoZone media"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'bajozone-media'
  and auth.role() = 'authenticated'
);

