import { createClient } from '@supabase/supabase-js'

/**
 * Browser client for the admin. The anon key is public by design: what an
 * account may do is decided by RLS (supabase/migrations/*_blog.sql), which
 * only lets users listed in public.admins write.
 */
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)

export const IMAGE_BUCKET = 'blog-images'
