#!/usr/bin/env node

/**
 * Quick script to check if environment variables are configured
 * Run with: node scripts/check-env.js
 */

console.log("\n🔍 Checking Environment Variables...\n")

const checks = [
    { name: "NEXT_PUBLIC_SUPABASE_URL", value: process.env.NEXT_PUBLIC_SUPABASE_URL },
    { name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
    { name: "SUPABASE_SERVICE_ROLE_KEY", value: process.env.SUPABASE_SERVICE_ROLE_KEY },
]

let allGood = true

checks.forEach(({ name, value }) => {
    if (value) {
        console.log(`✅ ${name}: ${value.substring(0, 20)}...`)
    } else {
        console.log(`❌ ${name}: NOT SET`)
        allGood = false
    }
})

console.log("\n" + "=".repeat(50))

if (allGood) {
    console.log("✅ All environment variables are configured!")
    console.log("\n💡 If you just added them, restart your dev server:")
    console.log("   Press Ctrl+C to stop, then run: npm run dev")
} else {
    console.log("❌ Some environment variables are missing!")
    console.log("\n📝 To fix:")
    console.log("   1. Go to: https://app.supabase.com")
    console.log("   2. Select your project → Settings → API")
    console.log("   3. Copy the values to .env file")
    console.log("   4. Restart your dev server")
}

console.log("\n")
