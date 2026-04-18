# Developer Commands

Source of truth: [`justfile`](../justfile) at the repo root. Run `just` (no args) for a one-line summary of every recipe. This doc adds longer-form context where a recipe has a gotcha worth knowing about.

## Local development

| Recipe | What |
|---|---|
| `just dev` | Next.js dev server on `localhost:3000` |
| `just stop` | Kill whatever is bound to `:3000` (no-op if nothing is running) |
| `just clean` | Delete `.next/`, `node_modules/`, `coverage/` |
| `just fresh` | `clean` + `bun install` — full toolchain reset |

## Tests & static checks

| Recipe | What |
|---|---|
| `just test [filter]` | Run Vitest once. Optional filename filter (e.g. `just test env`) |
| `just watch` | Vitest watch mode — re-runs on file save |
| `just typecheck` | `tsc --noEmit` |
| `just check` | `typecheck` + `test` + `build` — the pre-push gate |
| `just check-dev` | Same as `check` but dev-server-safe: stops dev, runs checks, clears `.next`, tells you how to restart |

`just check` runs everything Vercel will run in its build. If it's green locally, the deploy should be green too.

**Running check with dev up:** `just check` produces a production `.next/` that conflicts with a running `next dev` process — the dev server picks up stale module IDs and throws "Cannot find module './NNN.js'" when you hit a route. Use `just check-dev` instead while iterating: it stops dev, runs the gate, wipes `.next`, and lets you bring dev back clean with `just dev`.

## Build

| Recipe | What |
|---|---|
| `just build` | Next.js production build |

## Vercel

| Recipe | What |
|---|---|
| `just deploy` | Deploy current tree to **production** (prompts `[y/N]`) |
| `just preview` | Deploy a throwaway preview URL |
| `just logs` | Stream logs from the latest production deployment |
| `just env-pull [env]` | Pull Vercel env vars to `.env.<env>.local` (default `development`) |
| `just env-list [env]` | List env var *names* for an environment (default `production`) |
| `just prod` | Curl the production URL: status, TTFB, size, signature content |
| `just open` | Open the production URL in the default browser |
| `just dashboard` | Open the Vercel dashboard for this project |

### Notes

- **`just deploy` is rarely needed.** Pushing to `main` auto-deploys via the GitHub integration. Reach for the CLI deploy only when you want to push the current *uncommitted* working tree (e.g., trying a fix without polluting history).
- **`just env-pull` writes to `.env.<env>.local`, not `.env.local`.** That's intentional — it won't overwrite your primary env file. To use the pulled values as default, copy them over deliberately: `cp .env.development.local .env.local`.
- **`just env-list` prints names only**, never values. Use `just env-pull` to retrieve values.
- **`just prod` counts signature strings** (`Slow Cooker`, `gentle`, `Albuquerque`, etc.) in the returned HTML — a fast sniff test that the deploy actually went out.

## Common flows

```bash
# ship an iteration
just check            # local gate
git push              # auto-deploys via GitHub integration
just prod             # confirm the new version is live

# preview a scratch branch without merging
git checkout -b scratch/thing
just preview          # returns a unique preview URL

# narrow a test run while iterating
just test env         # only tests in files matching "env"
just watch            # then run this to iterate

# reset a wedged toolchain
just fresh
just check
```
