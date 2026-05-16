-- ════════════════════════════════════════════════════════════════
--  BajoZone — Migration: About Page new fields
--  شغّل هذا الملف في Supabase → SQL Editor → New Query → Run
--  آمن للتشغيل أكثر من مرة (IF NOT EXISTS / ON CONFLICT)
-- ════════════════════════════════════════════════════════════════

-- ─── 1. Add missing columns to site_settings ─────────────────────
--  الأعمدة الجديدة المضافة لصفحة "تعرف علي"

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS about_journey_logos     JSONB    NOT NULL DEFAULT '[]'::JSONB,
  ADD COLUMN IF NOT EXISTS about_keywords          JSONB    NOT NULL DEFAULT '[]'::JSONB,
  ADD COLUMN IF NOT EXISTS about_var_enabled       BOOLEAN  NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS about_var_data          JSONB             DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS about_contact_invite_ar TEXT     NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS about_contact_invite_en TEXT     NOT NULL DEFAULT '';

-- Extra program fields used by the admin dashboard
ALTER TABLE public.programs
  ADD COLUMN IF NOT EXISTS cover_image TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;

-- ─── 2. Storage bucket — تحديث إذا كانت موجودة ──────────────────
--  يضمن أن الـ bucket عام وبالإعدادات الصحيحة

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'bajozone-media',
  'bajozone-media',
  true,
  52428800,
  ARRAY['image/png','image/jpeg','image/jpg','image/webp','image/gif','application/pdf','video/mp4']
)
ON CONFLICT (id) DO UPDATE SET
  public             = true,
  file_size_limit    = 52428800,
  allowed_mime_types = ARRAY['image/png','image/jpeg','image/jpg','image/webp','image/gif','application/pdf','video/mp4'];

-- ─── 3. Storage RLS policies — رفع الصور ─────────────────────────
--  قراءة عامة + رفع/تعديل/حذف للمسجلين فقط

DROP POLICY IF EXISTS "Public can read BajoZone media"        ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload BajoZone media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update BajoZone media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete BajoZone media" ON storage.objects;

CREATE POLICY "Public can read BajoZone media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'bajozone-media');

CREATE POLICY "Authenticated can upload BajoZone media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'bajozone-media'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated can update BajoZone media"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING  (bucket_id = 'bajozone-media' AND auth.role() = 'authenticated')
  WITH CHECK (bucket_id = 'bajozone-media' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated can delete BajoZone media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'bajozone-media' AND auth.role() = 'authenticated');

-- ─── 4. Verify — تأكد من النتيجة ─────────────────────────────────
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'site_settings'
  AND column_name IN (
    'about_image', 'about_gallery',
    'about_journey_logos', 'about_keywords',
    'about_var_enabled', 'about_var_data',
    'about_contact_invite_ar', 'about_contact_invite_en'
  )
ORDER BY column_name;

SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'programs'
  AND column_name IN ('logo_url', 'cover_image', 'is_featured')
ORDER BY column_name;
