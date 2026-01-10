/**
 * Standalone script to test Supabase connection
 * Run with: npx tsx scripts/test-supabase-connection.ts
 * Or: node --loader ts-node/esm scripts/test-supabase-connection.ts
 */

import { testSupabaseConnection } from '../services/supabase.js';

async function main() {
  console.log('\n🧪 Testing Supabase Connection...\n');
  
  const result = await testSupabaseConnection();
  
  if (result.connected) {
    console.log('✅ SUCCESS: Connected to Supabase!');
    console.log(`   Message: ${result.message}`);
    if (result.url) {
      console.log(`   URL: ${result.url}`);
    }
    process.exit(0);
  } else {
    console.error('❌ FAILED: Could not connect to Supabase');
    console.error(`   Message: ${result.message}`);
    if (result.error) {
      console.error(`   Error: ${result.error}`);
    }
    if (result.url) {
      console.log(`   Attempted URL: ${result.url}`);
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});

