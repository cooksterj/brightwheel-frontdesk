# Architecture

How the pieces fit together. Four diagrams, each answering a different question.

- [Components](#components) — what services talk to each other
- [Chat request flow](#chat-request-flow) — what happens when a parent asks a question
- [Ingestion flow](#ingestion-flow) — how the handbook becomes searchable vectors
- [Data model](#data-model) — what lives in Postgres

---

## Components

A map of the services in play and which code lives where. The app runs as a single Next.js 15 deployment on Vercel; two external AI providers (Voyage for embeddings, Anthropic for answers) and one database (Supabase Postgres + pgvector).

```mermaid
flowchart LR
    classDef ext fill:#f4ebda,stroke:#8d3a25,color:#221c16
    classDef svc fill:#ecdfc5,stroke:#5a4c3e,color:#221c16
    classDef user fill:#e5a48e,stroke:#8d3a25,color:#221c16

    User([Parent / Operator]):::user

    subgraph Vercel["Vercel — Next.js 15 App Router"]
      Landing["/ (landing page)<br/>React Server Component"]
      Chat["/chat<br/>Client Component"]
      API["/api/chat<br/>Node runtime route"]
    end

    subgraph Supabase["Supabase"]
      DB[("handbook_sections<br/>+ pgvector 1024-dim")]
      RPC["match_handbook_sections<br/>RPC"]
    end

    Voyage["Voyage AI<br/>voyage-4-lite"]:::ext
    Claude["Anthropic<br/>Claude Sonnet 4.6"]:::ext

    User --> Landing
    User --> Chat
    Chat -- "POST /api/chat" --> API
    API -- "embed query" --> Voyage
    API -- "rpc top-k" --> RPC
    RPC --> DB
    API -- "stream answer" --> Claude

    class Landing,Chat,API svc
    class DB,RPC svc
```

**Legend.** Boxes inside `Vercel` and `Supabase` are our code / our data. Boxes outside are third-party APIs we call.

---

## Chat request flow

The moment a parent hits Send. Everything below happens in a single streaming HTTP response — tokens start flowing back to the browser within a second of the embedding call finishing.

```mermaid
sequenceDiagram
    autonumber
    participant B as Browser (/chat)
    participant API as /api/chat (Vercel)
    participant V as Voyage
    participant DB as Supabase
    participant C as Claude

    B->>API: POST { messages }
    Note over API: extract last user message
    API->>V: embed(text, input_type=query)
    V-->>API: 1024-dim vector
    API->>DB: rpc('match_handbook_sections', vec, k=5)
    DB-->>API: top-5 sections + similarity
    Note over API: build system prompt<br/>(handbook sections + citation rules)<br/>with cache_control: ephemeral
    API->>C: messages.stream(system, conversation)
    loop streaming
      C-->>API: text_delta event
      API-->>B: text chunk (ReadableStream)
    end
    Note over B: useChat() appends each chunk<br/>to the in-flight assistant message
```

**Why the cache_control block matters.** The system prompt — which includes the retrieved handbook sections plus ~500 tokens of instructions — is cached with Anthropic's prompt caching for 5 minutes. Follow-up messages within the same window reuse the cache; you only pay the full context cost on the first turn of a conversation burst.

---

## Ingestion flow

How markdown becomes searchable vectors. Runs locally via `just seed`; can also run on save from the (future) operator dashboard.

```mermaid
flowchart LR
    MD[content/handbook/<br/>slow-cooker.md]
    Chunk["chunkHandbook()<br/>split on ## headings"]
    Seed["scripts/seed-handbook.ts<br/>just seed"]
    Voyage[Voyage AI<br/>input_type=document]
    DB[("handbook_sections<br/>upsert by slug")]
    Ver[(handbook_section_versions<br/>audit snapshot)]

    MD --> Chunk
    Chunk -- "15 × {slug, title, body}" --> Seed
    Seed -- "POST /v1/embeddings" --> Voyage
    Voyage -- "15 × 1024-dim vectors" --> Seed
    Seed -- "upsert row<br/>(slug, title, body, embedding)" --> DB
    DB -.-> |on future edit, pre-update| Ver
```

**Idempotent by slug.** Each section's slug (e.g. `illness-policy`) is a unique constraint in `handbook_sections`. Re-running `just seed` after a handbook edit re-embeds and upserts in place — no duplicates, no deletes.

**Edit story.** When the operator dashboard lands, a section save triggers the same path: snapshot old row into `handbook_section_versions`, re-embed, upsert into `handbook_sections`. The chat endpoint reads a fresh retrieval on every request, so edits appear instantly with no cache-bust.

---

## Data model

```mermaid
erDiagram
    handbook_sections {
        uuid id PK
        text slug UK "e.g. illness-policy"
        text title
        text body "markdown"
        vector embedding "pgvector 1024-dim"
        int version "bumps on edit"
        timestamptz updated_at
        text updated_by
        timestamptz deleted_at "soft delete"
    }
    handbook_section_versions {
        uuid id PK
        uuid section_id FK
        text title
        text body
        int version
        timestamptz archived_at
        text archived_by
    }
    handbook_sections ||--o{ handbook_section_versions : "audit trail"
```

**Index.** An HNSW index on `embedding vector_cosine_ops` keeps similarity search sub-millisecond even as the section count grows.

**RLS.** Row-level security is enabled on both tables with **no policies** — all reads and writes go through the server using `SUPABASE_SECRET_KEY`, which bypasses RLS. When the admin UI lands, authenticated policies go here.

---

## Trust & failure modes

- **Retrieval misses.** If no section is similar enough to the query, Claude is instructed to say so and suggest emailing the director rather than hallucinate. The empty-retrieval case is explicitly handled in `buildSystemPrompt`.
- **Emergency routing.** Claude is told in the system prompt to stop and direct to 911 for medical emergencies or suspected abuse, *before* citing handbook text.
- **Voyage outage.** The `/api/chat` route throws on embed failure — no retrieval attempt, no Claude call. Clean 500 to the browser; user sees a retry-friendly error message.
- **Supabase outage.** Retrieval throws; same behavior.
- **Citation integrity.** Claude is instructed to use exact section titles from the retrieved context (e.g. `[§ Illness Policy]`). The dashboard can later parse these markers to verify citations point to real sections.
