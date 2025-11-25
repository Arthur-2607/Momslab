import { cookies, headers } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
 
export async function supabaseServer() {
  const jar = await cookies()
  const proto = (await headers()).get('x-forwarded-proto')
  const isSecure = proto === 'https'
 
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return jar.get(name)?.value ?? null
        },
        set(name, value, options) {
          jar.set({ name, value, ...options, secure: isSecure })
        },
        remove(name) {
          jar.delete(name)
        },
      },
    }
  )
}
