#
# The Slow Cooker / Brightwheel Front Desk — developer recipes
#
# Run `just` (no args) for the list. Recipes are grouped:
#   - local     : dev server, stop, clean
#   - test      : test, watch, typecheck, check
#   - build     : build
#   - vercel    : deploy, preview, logs, env-pull, env-list, open, prod
#

set shell := ["bash", "-cu"]
set dotenv-load := true

PROD_URL := "https://brightwheelfrontdesk.vercel.app"
DEV_PORT := "3000"

# ──────────────────────────────────────────────────────────────────────────────
# default: list recipes
# ──────────────────────────────────────────────────────────────────────────────

_default:
    @just --list --unsorted

# ──────────────────────────────────────────────────────────────────────────────
# local
# ──────────────────────────────────────────────────────────────────────────────

# Start Next.js dev server on :3000
dev:
    bun run dev

# Kill whatever is bound to the dev port (safe if nothing is running)
stop:
    #!/usr/bin/env bash
    set -eo pipefail
    pids=$(lsof -ti :{{DEV_PORT}} 2>/dev/null || true)
    if [ -z "$pids" ]; then
      echo "nothing on :{{DEV_PORT}}"
      exit 0
    fi
    echo "killing:" $pids
    kill $pids

# Nuke build artifacts + node_modules + coverage
clean:
    rm -rf .next node_modules coverage

# clean + bun install (fully reset the toolchain)
fresh: clean
    bun install

# ──────────────────────────────────────────────────────────────────────────────
# test
# ──────────────────────────────────────────────────────────────────────────────

# Run the test suite once. Optional filter, e.g. `just test env`
test filter="":
    bun run test {{filter}}

# Vitest watch mode (re-runs on file changes)
watch:
    bun run test:watch

# TypeScript typecheck (no emit)
typecheck:
    bun run typecheck

# Pre-push gate: typecheck + tests + production build
check: typecheck test build
    @echo "✓ all checks passed"

# Dev-safe check: stops dev, runs the gate, clears .next, restart dev manually
check-dev:
    #!/usr/bin/env bash
    set -eo pipefail
    if lsof -ti :{{DEV_PORT}} >/dev/null 2>&1; then
      echo "→ stopping dev on :{{DEV_PORT}}"
      just stop
    fi
    just typecheck
    just test
    just build
    echo "→ clearing .next so the next `just dev` rebuilds from scratch"
    rm -rf .next
    echo "✓ check-dev complete — run \`just dev\` to bring the server back up"

# ──────────────────────────────────────────────────────────────────────────────
# build
# ──────────────────────────────────────────────────────────────────────────────

# Next.js production build (same as CI)
build:
    bun run build

# Parse handbook.md, embed via Voyage, upsert into Supabase (idempotent by slug)
seed:
    bun run scripts/seed-handbook.ts

# Seed 30 synthetic parent questions so the operator dashboard / gap detector have data
seed-questions:
    bun run scripts/seed-questions.ts

# DESTRUCTIVE: wipe handbook_sections, versions, and questions, then reseed both
reset:
    #!/usr/bin/env bash
    set -eo pipefail
    echo
    echo "  This will DELETE every row from:"
    echo "    • handbook_sections (including any merged from /admin/gaps)"
    echo "    • handbook_section_versions"
    echo "    • questions (seeded and real)"
    echo
    printf "  Proceed? [y/N] "
    read -r yn
    case "$yn" in
      y|Y|yes|YES)
        echo
        bun run scripts/reset-db.ts
        echo
        just seed
        echo
        just seed-questions
        ;;
      *)
        echo "aborted"
        exit 1
        ;;
    esac

# ──────────────────────────────────────────────────────────────────────────────
# vercel
# ──────────────────────────────────────────────────────────────────────────────

# Deploy to production (CLI — normally auto-deploy handles this)
deploy:
    @printf "Deploy current tree to PRODUCTION (%s)? [y/N] " "{{PROD_URL}}"; \
    read -r yn; [ "$yn" = "y" ] || { echo "aborted"; exit 1; }
    bunx vercel@latest --prod --yes

# Deploy a preview URL (no prompt, returns a unique URL)
preview:
    bunx vercel@latest --yes

# Stream logs from the latest production deployment
logs:
    bunx vercel@latest logs {{PROD_URL}}

# Pull Vercel env vars into .env.<env>.local (default: development)
env-pull env="development":
    bunx vercel@latest env pull .env.{{env}}.local --environment={{env}}

# List env vars for an environment (default: production)
env-list env="production":
    bunx vercel@latest env ls {{env}}

# Curl the production URL and check basic health
prod:
    @curl -sS -o /tmp/brightwheel-prod.html \
        -w "status=%{http_code}  ttfb=%{time_starttransfer}s  size=%{size_download}B\n" \
        {{PROD_URL}}
    @echo "--- signature markers:"
    @grep -oE "(Slow Cooker|gentle|Albuquerque|family day school)" /tmp/brightwheel-prod.html | sort | uniq -c

# Open the production site in the default browser
open:
    open {{PROD_URL}}

# Open the Vercel dashboard for this project
dashboard:
    open "https://vercel.com/cooksterjs-projects/brightwheel_frontdesk"
