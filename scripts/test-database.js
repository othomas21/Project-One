/**
 * Simple test script to verify database connection and add test data
 * Run with: node scripts/test-database.js
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test basic connection by checking if we can query studies
    const { data, error } = await supabase
      .from('studies')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Connection test failed:', error.message);
      return false;
    }
    
    console.log('✅ Successfully connected to Supabase');
    return true;
  } catch (error) {
    console.error('Connection error:', error.message);
    return false;
  }
}

async function checkTables() {
  console.log('\nChecking database tables...');
  
  const tables = ['profiles', 'patients', 'studies', 'series', 'instances'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);
      
      if (error) {
        console.log(`❌ Table ${table}: ${error.message}`);
      } else {
        console.log(`✅ Table ${table}: accessible`);
      }
    } catch (error) {
      console.log(`❌ Table ${table}: ${error.message}`);
    }
  }
}

async function countRecords() {
  console.log('\nCounting records in key tables...');
  
  const tables = ['patients', 'studies', 'series', 'instances'];
  
  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`📊 ${table}: ${count || 0} records`);
      }
    } catch (error) {
      console.log(`❌ ${table}: ${error.message}`);
    }
  }
}

async function main() {
  console.log('🔍 Curie Radiology Database Test\n');
  
  const connected = await testConnection();
  
  if (!connected) {
    console.log('\nPlease check your Supabase configuration and try again.');
    process.exit(1);
  }
  
  await checkTables();
  await countRecords();
  
  console.log('\n✅ Database test completed successfully!');
}

main().catch(console.error);