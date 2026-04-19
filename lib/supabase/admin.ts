import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getPublicEnv, getServerEnv } from "@/lib/env";

/**
 * Server-side Supabase client authenticated with SUPABASE_SECRET_KEY.
 *
 * Bypasses RLS, so it must ONLY be called from server runtimes (route
 * handlers, server components, seed scripts) — never from client code.
 *
 * `persistSession` is off because each serverless invocation is a fresh
 * cold-ish function; we have no cookie store to attach to.
 */
export function createAdminSupabase(): SupabaseClient {
  const server = getServerEnv();
  const pub = getPublicEnv();
  return createClient(
    pub.NEXT_PUBLIC_SUPABASE_URL,
    server.SUPABASE_SECRET_KEY,
    { auth: { persistSession: false } },
  );
}
