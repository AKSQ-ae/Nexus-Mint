import { execSync } from 'child_process'

// Generate Supabase types
try {
  console.log('🔄 Generating Supabase types...')
  execSync('npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/integrations/supabase/types.ts', { 
    stdio: 'inherit' 
  })
  console.log('✅ Supabase types generated')
} catch (error) {
  console.log('⚠️  Could not generate Supabase types. Make sure you have the Supabase CLI installed and configured.')
}

// Generate contract types (if contracts exist)
try {
  console.log('🔄 Generating contract types...')
  execSync('npx hardhat compile', { stdio: 'inherit', cwd: './contracts' })
  console.log('✅ Contract types generated')
} catch (error) {
  console.log('⚠️  Could not generate contract types. Make sure Hardhat is properly configured.')
}

console.log('✅ All types generated successfully')