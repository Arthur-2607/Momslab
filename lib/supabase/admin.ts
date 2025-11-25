import { createClient } from "@supabase/supabase-js"

/**
 * Admin Supabase client with service role key
 * This bypasses Row Level Security (RLS) and should ONLY be used in server-side code
 * for admin operations like authentication, user management, etc.
 * 
 * NEVER expose this client to the browser!
 */
export function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error(
            "Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
        )
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
}

