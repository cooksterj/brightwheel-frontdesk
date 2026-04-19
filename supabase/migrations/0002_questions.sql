-- 0002_questions.sql
-- Log of every parent question that hits /api/chat. Feeds the operator
-- question log and the knowledge-gap detector (phase 9).
--
-- Apply via Supabase SQL Editor.

create table if not exists public.questions (
  id              uuid primary key default gen_random_uuid(),
  query           text not null,
  query_embedding vector(1024),
  answer          text,
  retrieved_slugs text[] not null default '{}',
  top_similarity  double precision,
  confidence      text check (confidence in ('high','medium','low') or confidence is null),
  session_id      text,
  created_at      timestamptz not null default now()
);

create index if not exists questions_embedding_idx
  on public.questions using hnsw (query_embedding vector_cosine_ops);

create index if not exists questions_created_idx
  on public.questions (created_at desc);

create index if not exists questions_confidence_idx
  on public.questions (confidence);

-- Find similar questions, optionally filtered by confidence.
-- The gap detector calls this to grow clusters around a seed question.
create or replace function public.match_questions(
  query_embedding   vector(1024),
  match_count       int  default 10,
  confidence_filter text default null
)
returns table (
  id              uuid,
  query           text,
  similarity      float,
  confidence      text,
  retrieved_slugs text[],
  created_at      timestamptz
)
language sql stable
as $$
  select
    q.id,
    q.query,
    1 - (q.query_embedding <=> query_embedding) as similarity,
    q.confidence,
    q.retrieved_slugs,
    q.created_at
  from public.questions q
  where q.query_embedding is not null
    and (confidence_filter is null or q.confidence = confidence_filter)
  order by q.query_embedding <=> query_embedding
  limit match_count;
$$;

alter table public.questions enable row level security;
