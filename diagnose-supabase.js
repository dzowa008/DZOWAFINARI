// Supabase Diagnostic Script
// Run this to test your Supabase connection and identify issues

import { createClient } from '@supabase/supabase-js';

// Load environment variables
const supabaseUrl = 'https://evhakupxgyrfldtpahap.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2aGFrdXB4Z3lyZmxkdHBhaGFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODYxODksImV4cCI6MjA2ODY2MjE4OX0.MJV844MebqJxCU0Wk-KC8c2cHHHeg3uViTx076w1Sns';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runDiagnostics() {
  console.log('🔍 Starting Supabase Diagnostics...\n');

  // Test 1: Basic Connection
  console.log('1. Testing basic connection...');
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) {
      console.log('❌ Connection failed:', error.message);
      if (error.message.includes('relation "profiles" does not exist')) {
        console.log('💡 Issue: profiles table does not exist');
      }
    } else {
      console.log('✅ Basic connection successful');
    }
  } catch (err) {
    console.log('❌ Connection error:', err.message);
  }

  // Test 2: Check if tables exist
  console.log('\n2. Checking if required tables exist...');
  try {
    const { data: tablesData, error: tablesError } = await supabase
      .rpc('check_table_exists', { table_name: 'profiles' });
    
    if (tablesError) {
      console.log('❌ Cannot check tables:', tablesError.message);
    }
  } catch (err) {
    console.log('❌ Table check failed - tables likely don\'t exist');
  }

  // Test 3: Test Authentication
  console.log('\n3. Testing authentication system...');
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.log('❌ Auth error:', error.message);
    } else if (!user) {
      console.log('ℹ️  No user currently logged in (this is normal)');
    } else {
      console.log('✅ User authenticated:', user.email);
    }
  } catch (err) {
    console.log('❌ Auth system error:', err.message);
  }

  // Test 4: Test Storage Bucket
  console.log('\n4. Testing storage bucket...');
  try {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
      console.log('❌ Storage error:', error.message);
    } else {
      const userFilesBucket = data.find(bucket => bucket.id === 'user-files');
      if (userFilesBucket) {
        console.log('✅ user-files bucket exists');
      } else {
        console.log('❌ user-files bucket does not exist');
        console.log('Available buckets:', data.map(b => b.id));
      }
    }
  } catch (err) {
    console.log('❌ Storage system error:', err.message);
  }

  // Test 5: Try to create a test note (will fail if tables don't exist)
  console.log('\n5. Testing note creation (without auth)...');
  try {
    const testNote = {
      id: 'test-note-' + Date.now(),
      title: 'Test Note',
      content: 'This is a test note',
      type: 'text',
      tags: ['test'],
      category: 'Test',
      user_id: '00000000-0000-0000-0000-000000000000' // Dummy UUID
    };

    const { data, error } = await supabase
      .from('notes')
      .insert([testNote])
      .select();

    if (error) {
      console.log('❌ Note creation failed:', error.message);
      if (error.message.includes('relation "notes" does not exist')) {
        console.log('💡 Issue: notes table does not exist');
      } else if (error.message.includes('RLS')) {
        console.log('💡 Issue: Row Level Security is blocking (this is expected without auth)');
      }
    } else {
      console.log('✅ Note creation successful (cleaning up...)');
      // Clean up test note
      await supabase.from('notes').delete().eq('id', testNote.id);
    }
  } catch (err) {
    console.log('❌ Note creation error:', err.message);
  }

  console.log('\n📋 DIAGNOSIS SUMMARY:');
  console.log('====================');
  console.log('If you see "relation does not exist" errors, you need to:');
  console.log('1. Go to your Supabase dashboard');
  console.log('2. Navigate to SQL Editor');
  console.log('3. Run the setup-supabase-complete.sql script');
  console.log('4. Create the storage bucket if needed');
  console.log('\nIf you see RLS (Row Level Security) errors, that\'s normal without authentication.');
  console.log('The app should work once users are logged in.');
}

// Run diagnostics
runDiagnostics().catch(console.error);
