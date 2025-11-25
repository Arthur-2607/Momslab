/**
 * Test script to verify Supabase connection and admin data
 * Run with: npx tsx scripts/test-admin-connection.ts
 */

import { createAdminClient } from "../lib/supabase/admin"

async function testConnection() {
  console.log("🔍 Testing Supabase Admin Connection...\n")

  try {
    // Test 1: Create client
    console.log("1️⃣ Creating admin client...")
    const supabase = createAdminClient()
    console.log("✅ Admin client created\n")

    // Test 2: Count all admins
    console.log("2️⃣ Checking admins table...")
    const { data: allAdmins, error: countError, count } = await supabase
      .from("admins")
      .select("*", { count: "exact" })

    if (countError) {
      console.error("❌ Error querying admins:", countError)
      return
    }

    console.log(`✅ Found ${count} admin(s) in database`)
    console.log("\n📋 Admins list:")
    console.table(
      allAdmins?.map((a) => ({
        id: a.id,
        username: a.username,
        name: a.name,
        role: a.role,
        branch_id: a.branch_id,
      }))
    )

    // Test 3: Test specific username
    const testUsername = "admin" // Change this to your test username
    console.log(`\n3️⃣ Testing query for username: "${testUsername}"`)
    
    const { data: specificAdmin, error: specificError } = await supabase
      .from("admins")
      .select("*")
      .eq("username", testUsername)
      .single()

    if (specificError) {
      console.error("❌ Error:", specificError)
      if (specificError.code === "PGRST116") {
        console.log(`\n💡 No admin found with username "${testUsername}"`)
        console.log("   Create one in your Supabase dashboard or with seed script")
      }
    } else {
      console.log("✅ Found admin:", specificAdmin)
    }

  } catch (error) {
    console.error("❌ Fatal error:", error)
  }
}

testConnection()

