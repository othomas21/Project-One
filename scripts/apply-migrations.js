/**
 * Apply database migrations to Supabase
 * This script reads migration files and applies them using the service role key
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase environment variables');
  console.error('Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create admin client with service role key
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runSQL(sql, description) {
  console.log(`Running: ${description}`);
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error(`❌ Error: ${error.message}`);
      return false;
    }
    
    console.log(`✅ Success: ${description}`);
    return true;
  } catch (error) {
    // Try direct query if RPC doesn't work
    try {
      const result = await supabase.from('_temp').select('*').limit(0);
      // This will fail but we can use the connection to run raw SQL
      console.error(`❌ Error executing SQL: ${error.message}`);
      console.log('Note: Direct SQL execution may require database direct access');
      return false;
    } catch {
      console.error(`❌ Error: ${error.message}`);
      return false;
    }
  }
}

async function applyMigrations() {
  console.log('🚀 Applying Supabase migrations...\n');
  
  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    console.error('❌ Migrations directory not found:', migrationsDir);
    process.exit(1);
  }
  
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();
  
  if (migrationFiles.length === 0) {
    console.log('No migration files found');
    return;
  }
  
  console.log(`Found ${migrationFiles.length} migration files:\n`);
  
  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    console.log(`\n📄 Processing: ${file}`);
    console.log('─'.repeat(50));
    
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      const success = await runSQL(statement, `Statement ${i + 1} from ${file}`);
      
      if (!success) {
        console.error(`❌ Migration failed at ${file}, statement ${i + 1}`);
        // Continue with other statements
      }
      
      // Small delay between statements
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  console.log('\n✅ Migration process completed!');
  console.log('Note: Some errors may be expected if tables already exist or if RLS policies are already in place.');
}

// Alternative: Just show the SQL that needs to be run
async function showMigrations() {
  console.log('📋 Migration SQL to run in Supabase SQL Editor:\n');
  
  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();
  
  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    console.log(`-- Migration: ${file}`);
    console.log('-- ' + '='.repeat(50));
    console.log(sql);
    console.log('\n-- End of ' + file + '\n');
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--show-only')) {
    await showMigrations();
  } else {
    await applyMigrations();
  }
}

main().catch(console.error);