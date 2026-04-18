/**
 * Cheap first-line defense against drive-by abuse of /api/chat.
 *
 * Accepts requests whose `Origin` header is one of:
 *   - the production alias (brightwheelfrontdesk.vercel.app)
 *   - a Vercel preview deploy of this project (*.vercel.app with our prefix)
 *   - localhost (any port) for dev
 *
 * A determined script can spoof `Origin`. This isn't meant to stop a
 * motivated attacker — only to block bots, casual curl loops, and
 * cross-site POSTs from other pages.
 */

const PROD_HOST = "brightwheelfrontdesk.vercel.app";
const PREVIEW_HOST_PREFIX = "brightwheelfrontdesk-";

export interface OriginCheckOptions {
  /** Development convenience — accept any origin. */
  allowAll?: boolean;
}

export function isAllowedOrigin(
  origin: string | null | undefined,
  opts: OriginCheckOptions = {},
): boolean {
  if (opts.allowAll) return true;
  if (!origin) return false;

  let url: URL;
  try {
    url = new URL(origin);
  } catch {
    return false;
  }

  const host = url.host.toLowerCase();

  // Localhost (any port) over http or https
  if (
    (url.protocol === "http:" || url.protocol === "https:") &&
    (url.hostname === "localhost" || url.hostname === "127.0.0.1")
  ) {
    return true;
  }

  if (url.protocol !== "https:") return false;

  if (host === PROD_HOST) return true;
  if (host.startsWith(PREVIEW_HOST_PREFIX) && host.endsWith(".vercel.app")) {
    return true;
  }
  return false;
}
