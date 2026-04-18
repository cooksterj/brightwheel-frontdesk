# Brightwheel Front Desk — Agent Notes

- Next.js **15** (App Router), React 19, Tailwind v4.
- Keep modules small and testable: one responsibility per file, I/O (DB/LLM/env) behind injectable adapters. No monolithic `*.ts` files.
- Tests are colocated: `foo.ts` + `foo.test.ts` in the same directory. Vitest runs them.
- See `docs/PROJECT_PLAN.md` for scope and `docs/SETUP.md` for external-service setup.
