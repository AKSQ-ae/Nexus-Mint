const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  // Add other required env vars as needed
]

const missingVars = requiredEnvVars.filter(
  (varName) => !process.env[varName] && !import.meta.env?.[varName]
)

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:')
  missingVars.forEach((varName) => {
    console.error(`   - ${varName}`)
  })
  process.exit(1)
} else {
  console.log('✅ All required environment variables are set')
}