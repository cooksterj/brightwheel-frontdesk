-- 0004_questions_intent.sql
-- Record the intent classifier's decision for each logged question.
-- Enables operator filtering and excluding emergency/tour from gap detection.

alter table public.questions
  add column if not exists intent text check (
    intent in ('emergency', 'illness', 'tour', 'general') or intent is null
  );

create index if not exists questions_intent_idx
  on public.questions (intent);
