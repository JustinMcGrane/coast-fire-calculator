import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Server-only client using the service role key — bypasses RLS.
// Never import this into client components. Used for Stripe webhooks and cron jobs.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
