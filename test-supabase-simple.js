// Simple Supabase Test - Run this after setting up database
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://evhakupxgyrfldtpahap.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2aGFrdXB4Z3lyZmxkdHBhaGFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODYxODksImV4cCI6MjA2ODY2MjE4OX0.MJV844MebqJxCU0Wk-KC8c2cHHHeg3uViTx076w1Sns'
);

async function testSetup() {
  console.log('🧪 Testing Supabase Setup...\n');

  // Test 1: Check if tables exist
  console.log('1. Testing profiles table...');
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) {
      console.log('❌ Profiles table error:', error.message);
    } else {
      console.log('✅ Profiles table exists');
    }
  } catch (err) {
    console.log('❌ Profiles table missing');
  }

  console.log('2. Testing notes table...');
  try {
    const { data, error } = await supabase.from('notes').select('count').limit(1);
    if (error) {
      console.log('❌ Notes table error:', error.message);
    } else {
      console.log('✅ Notes table exists');
    }
  } catch (err) {
    console.log('❌ Notes table missing');
  }

  // Test 3: Check storage
  console.log('3. Testing storage...');
  try {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
      console.log('❌ Storage error:', error.message);
    } else {
      const bucket = data.find(b => b.id === 'user-files');
      if (bucket) {
        console.log('✅ user-files bucket exists');
      } else {
        console.log('❌ user-files bucket missing');
        console.log('Available buckets:', data.map(b => b.id));
      }
    }
  } catch (err) {
    console.log('❌ Storage error:', err.message);
  }

  console.log('\n📋 SUMMARY:');
  console.log('If you see ✅ for all tests, your setup is complete!');
  console.log('If you see ❌, follow the setup guide again.');
}

testSetup().catch(console.error);
