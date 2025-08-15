-- Supabase Storage Setup for DzowaAI Notes App
-- Run this in your Supabase SQL editor

-- Create storage bucket for user files (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'user-files', 
  'user-files', 
  false, -- Private bucket for security
  52428800, -- 50MB limit
  ARRAY['image/*', 'application/pdf', 'text/*', 'application/vnd.openxmlformats-officedocument.*']
)
ON CONFLICT (id) DO NOTHING;

-- Note: RLS is already enabled on storage.objects and storage.buckets by default in Supabase

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can access own bucket" ON storage.buckets;

-- Create bucket access policy
CREATE POLICY "Users can access own bucket" ON storage.buckets
FOR SELECT USING (
  id = 'user-files' AND 
  auth.role() = 'authenticated'
);

-- Create storage policies for user files bucket
CREATE POLICY "Users can upload own files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'user-files' AND 
  auth.role() = 'authenticated' AND
  auth.uid()::text = (string_to_array(name, '/'))[1]
);

CREATE POLICY "Users can view own files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'user-files' AND 
  auth.role() = 'authenticated' AND
  auth.uid()::text = (string_to_array(name, '/'))[1]
);

CREATE POLICY "Users can update own files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'user-files' AND 
  auth.role() = 'authenticated' AND
  auth.uid()::text = (string_to_array(name, '/'))[1]
);

CREATE POLICY "Users can delete own files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'user-files' AND 
  auth.role() = 'authenticated' AND
  auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- Note: Permissions are already granted by default in Supabase

-- Verify setup
SELECT 
  'Bucket created successfully' as status,
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'user-files';

SELECT 
  'Policies created successfully' as status,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';
