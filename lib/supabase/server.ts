import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";

export function createServerSupabaseClient(
  url: string,
  publishableKey: string,
  cookies: CookieMethodsServer,
) {
  if (!url || !publishableKey) {
    throw new Error("createServerSupabaseClient: url and publishableKey are required");
  }
  return createServerClient(url, publishableKey, { cookies });
}
