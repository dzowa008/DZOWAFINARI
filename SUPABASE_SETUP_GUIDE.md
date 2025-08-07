# 🚀 Complete Supabase Setup Guide for DzowaAI Notes

## Step 1: Access Your Supabase Dashboard

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Find your project: **evhakupxgyrfldtpahap** (from your .env file)
4. Click on your project to open it

## Step 2: Open SQL Editor

1. In the left sidebar, click on **"SQL Editor"**
2. You'll see a code editor where you can run SQL commands

## Step 3: Run the Database Setup Script

**COPY AND PASTE** this entire script into the SQL Editor:

```sql
-- ============================================
-- COMPLETE SUPABASE SETUP FOR DZOWAI NOTES
-- ============================================

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('text', 'audio', 'video', 'image', 'document')),
  tags TEXT[] DEFAULT '{}',
  category TEXT NOT NULL DEFAULT 'Personal',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  summary TEXT,
  transcription TEXT,
  is_starred BOOLEAN DEFAULT FALSE,
  audio_url TEXT,
  duration INTEGER,
  file_url TEXT,
  source_file TEXT,
  extracted_from TEXT
);

-- 3. Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- 4. Create Security Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 5. Create Security Policies for notes
CREATE POLICY "Users can view own notes" ON notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes" ON notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes" ON notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes" ON notes
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS notes_user_id_idx ON notes(user_id);
CREATE INDEX IF NOT EXISTS notes_created_at_idx ON notes(created_at);
CREATE INDEX IF NOT EXISTS notes_updated_at_idx ON notes(updated_at);

-- 7. Create function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Step 4: Execute the Script

1. After pasting the script, click the **"RUN"** button (usually blue button in the top right)
2. Wait for it to complete - you should see success messages
3. If there are any errors, copy them and let me know

## Step 5: Set Up Storage Bucket

1. In the left sidebar, click on **"Storage"**
2. Click **"Create a new bucket"**
3. Name: `user-files`
4. Make it **Private** (not public)
5. Click **"Create bucket"**

## Step 6: Set Up Storage Policies

1. Still in Storage, click on your `user-files` bucket
2. Go to the **"Policies"** tab
3. Click **"New Policy"**
4. Use this template for **INSERT**:

```sql
CREATE POLICY "Users can upload own files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'user-files' AND 
  auth.role() = 'authenticated' AND
  auth.uid()::text = (string_to_array(name, '/'))[1]
);
```

5. Create another policy for **SELECT**:

```sql
CREATE POLICY "Users can view own files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'user-files' AND 
  auth.role() = 'authenticated' AND
  auth.uid()::text = (string_to_array(name, '/'))[1]
);
```

## Step 7: Verify Setup

Go back to SQL Editor and run this verification query:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'notes');

-- Check if policies exist
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

You should see:
- `profiles` and `notes` tables
- Multiple policies for both tables

## Step 8: Test Your App

1. Go back to your app
2. Try signing up with a new account
3. Try creating a note
4. The data should now be stored in Supabase!

## 🆘 If You Still Have Issues

1. Check the browser console for errors (F12 → Console)
2. Check the Supabase logs (Dashboard → Logs)
3. Make sure your `.env` file has the correct Supabase URL and key
4. Verify you're running the app with `npm run dev`

## 📧 Your Current Supabase Config
- URL: `https://evhakupxgyrfldtpahap.supabase.co`
- Project: `evhakupxgyrfldtpahap`

Let me know if you encounter any errors during this process!
