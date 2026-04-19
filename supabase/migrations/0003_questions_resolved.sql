-- 0003_questions_resolved.sql
-- Mark questions as resolved once the operator merges a gap-cluster into
-- the handbook. Resolved questions are excluded from future gap detection.

alter table public.questions
  add column if not exists resolved_at timestamptz;

create index if not exists questions_resolved_idx
  on public.questions (resolved_at);
