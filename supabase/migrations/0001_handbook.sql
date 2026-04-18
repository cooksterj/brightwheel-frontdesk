-- 0001_handbook.sql
-- Handbook storage with semantic retrieval (Voyage voyage-4-lite = 1024 dims).
-- Apply via Supabase SQL Editor (Project → SQL → paste → Run).

create extension if not exists vector;

-- Live sections. One row per H2 section from content/handbook/slow-cooker.md.
create table if not exists public.handbook_sections (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  body        text not null,
  embedding   vector(1024),
  version     int not null default 1,
  updated_at  timestamptz not null default now(),
  updated_by  text,
  deleted_at  timestamptz
);

-- Audit trail. Each save snapshots the previous state here before updating.
create table if not exists public.handbook_section_versions (
  id          uuid primary key default gen_random_uuid(),
  section_id  uuid not null references public.handbook_sections(id) on delete cascade,
  title       text not null,
  body        text not null,
  version     int not null,
  archived_at timestamptz not null default now(),
  archived_by text
);

-- Fast cosine-similarity search for 1024-dim embeddings.
create index if not exists handbook_sections_embedding_idx
  on public.handbook_sections
  using hnsw (embedding vector_cosine_ops);

-- updated_at auto-touch on UPDATE.
create or replace function public.handbook_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists handbook_sections_touch on public.handbook_sections;
create trigger handbook_sections_touch
  before update on public.handbook_sections
  for each row execute function public.handbook_touch_updated_at();

-- Top-k retrieval RPC used by /api/chat.
create or replace function public.match_handbook_sections(
  query_embedding vector(1024),
  match_count     int default 5
)
returns table (
  slug       text,
  title      text,
  body       text,
  similarity float
)
language sql stable
as $$
  select
    s.slug,
    s.title,
    s.body,
    1 - (s.embedding <=> query_embedding) as similarity
  from public.handbook_sections s
  where s.deleted_at is null
    and s.embedding is not null
  order by s.embedding <=> query_embedding
  limit match_count;
$$;

-- RLS on, no policies. All access is server-side via SUPABASE_SECRET_KEY,
-- which bypasses RLS. Add public/authenticated policies later if the admin
-- UI ever needs direct browser access.
alter table public.handbook_sections        enable row level security;
alter table public.handbook_section_versions enable row level security;
