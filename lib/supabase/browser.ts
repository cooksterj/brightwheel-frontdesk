import { createBrowserClient } from "@supabase/ssr";

export function createBrowserSupabaseClient(url: string, publishableKey: string) {
  if (!url || !publishableKey) {
    throw new Error("createBrowserSupabaseClient: url and publishableKey are required");
  }
  return createBrowserClient(url, publishableKey);
}
