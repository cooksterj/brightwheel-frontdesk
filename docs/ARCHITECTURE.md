# Architecture

How the pieces fit together. Five diagrams, each answering a different question.

- [Components](#components): what services talk to each other
- [Chat request flow](#chat-request-flow): what happens when a parent asks a question
- [Ingestion flow](#ingestion-flow): how the handbook becomes searchable vectors
- [Operator flow](#operator-flow): how an operator fixes a gap
- [Data model](#data-model): what lives in Postgres

---

## Components

A map of the services in play and which code lives where. The app runs as a single Next.js 15 deployment on Vercel; two external AI providers (Voyage for embeddings, Anthropic for answers + classification) and one database (Supabase Postgres + pgvector).

```mermaid
flowchart LR
    classDef ext fill:#f4ebda,stroke:#8d3a25,color:#221c16
    classDef svc fill:#ecdfc5,stroke:#5a4c3e,color:#221c16
    classDef user fill:#e5a48e,stroke:#8d3a25,color:#221c16

    Parent([Parent]):::user
    Operator([Operator]):::user

    subgraph Vercel["Vercel: Next.js 15 App Router"]
      Landing["/ (landing)<br/>RSC"]
      Chat["/chat<br/>client"]
      AdminH["/admin/handbook<br/>RSC + client editor"]
      AdminG["/admin/gaps<br/>client"]
      ChatAPI["/api/chat<br/>Node runtime"]
      AdminHAPI["/api/admin/handbook/[slug]<br/>GET · PATCH"]
      AdminGAPI["/api/admin/gaps<br/>+ /gaps/merge"]
    end

    subgraph Supabase["Supabase"]
      DBH[("handbook_sections<br/>pgvector 1024")]
      DBV[("handbook_section_versions<br/>audit")]
      DBQ[("questions<br/>pgvector 1024")]
      RPC1["match_handbook_sections<br/>RPC"]
      RPC2["match_questions<br/>RPC"]
    end

    Voyage["Voyage AI<br/>voyage-4-lite"]:::ext
    Sonnet["Anthropic<br/>Claude Sonnet 4.6<br/>(answers)"]:::ext
    Haiku["Anthropic<br/>Claude Haiku 4.5<br/>(classify · draft)"]:::ext

    Parent --> Landing
    Parent --> Chat
    Operator --> AdminH
    Operator --> AdminG

    Chat -- POST --> ChatAPI
    AdminH -- PATCH --> AdminHAPI
    AdminG -- GET/POST --> AdminGAPI

    ChatAPI -- classify --> Haiku
    ChatAPI -- embed query --> Voyage
    ChatAPI -- retrieve --> RPC1
    ChatAPI -- stream answer --> Sonnet
    ChatAPI -- log Q&A --> DBQ

    AdminHAPI -- re-embed --> Voyage
    AdminHAPI -- snapshot --> DBV
    AdminHAPI -- update --> DBH

    AdminGAPI -- fetch unresolved --> DBQ
    AdminGAPI -- draft per cluster --> Haiku
    AdminGAPI -- new section --> DBH
    AdminGAPI -- re-embed --> Voyage
    AdminGAPI -- mark resolved --> DBQ

    RPC1 --> DBH
    RPC2 --> DBQ

    class Landing,Chat,AdminH,AdminG,ChatAPI,AdminHAPI,AdminGAPI svc
    class DBH,DBV,DBQ,RPC1,RPC2 svc
```

**Legend.** Boxes inside `Vercel` and `Supabase` are our code / our data. Boxes outside are third-party APIs we call.

---

## Chat request flow

The moment a parent hits Send. Everything below happens inside a single streaming HTTP response; text starts flowing back to the browser within ~1.5 seconds of the POST (intent classify ≈ 300ms, embed ≈ 150ms, retrieval ≈ 50ms, then Sonnet tokens begin).

```mermaid
sequenceDiagram
    autonumber
    participant B as Browser (/chat)
    participant API as /api/chat (Vercel)
    participant H as Haiku 4.5
    participant V as Voyage
    participant DB as Supabase
    participant S as Sonnet 4.6

    B->>API: POST { messages }
    Note over API: Origin allowlist + size caps<br/>(403 / 413 on fail)
    API->>H: classifyIntent(lastUserMessage)
    H-->>API: { intent, rationale }

    alt intent == "emergency"
      API-->>B: canned "call 911" text (no LLM stream)
      API->>DB: insert questions row<br/>(null embedding, intent=emergency)
    else intent in { illness, tour, general }
      API->>V: embed(text, input_type=query)
      V-->>API: 1024-dim vector
      API->>DB: rpc('match_handbook_sections', vec, k=5)
      DB-->>API: top-5 sections + similarity
      Note over API: build system prompt<br/>(handbook + citation rules<br/>+ intent-tailored closer)<br/>cache_control: ephemeral
      API->>S: messages.stream(system, conversation)
      loop streaming
        S-->>API: text_delta
        API-->>B: text chunk
      end
      API->>DB: insert questions row<br/>(vector, intent, slugs, confidence)
    end
```

**Why the cache_control block matters.** The system prompt (which includes the retrieved handbook sections plus ~500 tokens of instructions) is cached with Anthropic's prompt caching for 5 minutes. Follow-up messages within the same window reuse the cache; you only pay the full context cost on the first turn of a conversation burst.

**Why emergency short-circuits.** Medical danger answers shouldn't depend on Voyage or Sonnet being up. The canned response routes the parent to 911 and the center's phone; it's also the one code path that never pays a per-request Sonnet cost.

---

## Ingestion flow

How markdown becomes searchable vectors. This runs once at project setup via `just seed`.

```mermaid
flowchart LR
    MD[content/handbook/<br/>slow-cooker.md]
    Chunk["chunkHandbook()<br/>split on ## headings"]
    Seed["scripts/seed-handbook.ts<br/>just seed"]
    Voyage[Voyage AI<br/>input_type=document]
    DB[("handbook_sections<br/>upsert by slug")]

    MD --> Chunk
    Chunk -- "15 × {slug, title, body}" --> Seed
    Seed -- POST /v1/embeddings --> Voyage
    Voyage -- "15 × 1024-dim vectors" --> Seed
    Seed -- "upsert row<br/>(slug, title, body, embedding)" --> DB
```

**Idempotent by slug.** Each section's slug (e.g. `illness-policy`) is a unique constraint in `handbook_sections`. Re-running `just seed` after a manual edit re-embeds and upserts in place. No duplicates, no deletes.

**After first seed, the DB is the source of truth.** Operator edits go through `/admin/handbook` (see the next diagram); the markdown file is no longer canonical.

---

## Operator flow

Two distinct operator journeys, both hitting the same live `handbook_sections` table. Each edit becomes visible to the chat on the very next parent query (retrieval runs fresh on every request).

```mermaid
flowchart TB
    classDef ext fill:#f4ebda,stroke:#8d3a25,color:#221c16

    subgraph Edit["A. Edit a section (/admin/handbook/[slug])"]
      direction LR
      EditUI[Operator edits<br/>title / body]
      EditAPI["PATCH /api/admin/<br/>handbook/[slug]"]
      Voy1[Voyage<br/>re-embed]:::ext
      SnapV[(handbook_<br/>section_versions)]
      LiveH[(handbook_<br/>sections)]
      EditUI --> EditAPI
      EditAPI -- snapshot current --> SnapV
      EditAPI -- new vector --> Voy1
      Voy1 --> EditAPI
      EditAPI -- update row,<br/>version++ --> LiveH
    end

    subgraph Gaps["B. Close a knowledge gap (/admin/gaps)"]
      direction LR
      Load["operator loads /admin/gaps"]
      GetAPI["GET /api/admin/gaps"]
      Qs[(questions:<br/>medium + low,<br/>unresolved,<br/>not emergency/tour)]
      Cluster["clusterBySimilarity<br/>(τ = 0.6)"]
      Hai[Haiku 4.5<br/>propose section]:::ext
      Dash[cluster cards +<br/>editable proposals]
      Merge["POST /api/admin/<br/>gaps/merge"]
      Voy2[Voyage<br/>embed new section]:::ext
      NewH[(handbook_sections:<br/>new row, v1)]
      MarkR[(questions:<br/>resolved_at = now)]

      Load --> GetAPI
      GetAPI --> Qs
      Qs --> Cluster
      Cluster --> Hai
      Hai --> Dash
      Dash -- operator clicks Merge --> Merge
      Merge --> Voy2
      Voy2 --> Merge
      Merge --> NewH
      Merge --> MarkR
    end
```

**The flywheel.** Parent asks → chat logs the question with its confidence. Low-confidence questions accrue in `questions`. Operator visits `/admin/gaps`, reviews the clustered drafts, edits what needs editing, clicks Merge. The cluster's questions flip to `resolved`; the next parent asking about that topic gets a confident, cited answer from the new section.

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
    questions {
        uuid id PK
        text query
        vector query_embedding "pgvector 1024-dim"
        text answer
        textarray retrieved_slugs
        float top_similarity
        text confidence "high · medium · low"
        text intent "emergency · illness · tour · general"
        text session_id
        timestamptz resolved_at "set when merged into handbook"
        timestamptz created_at
    }
    handbook_sections ||--o{ handbook_section_versions : "audit trail"
```

**Indexes.**
- `handbook_sections`: HNSW on `embedding` (cosine) for sub-millisecond retrieval.
- `questions`: HNSW on `query_embedding` (cosine) for gap clustering; btree on `created_at`, `confidence`, `intent`, `resolved_at` for operator filters.

**RPCs.**
- `match_handbook_sections(query_embedding, match_count)`: top-k by cosine. Called on every chat request.
- `match_questions(query_embedding, match_count, confidence_filter)`: top-k similar parent questions. Available for future operator tooling.

**RLS.** Row-level security is enabled on every table with **no policies**. All reads and writes go through the server using `SUPABASE_SECRET_KEY`, which bypasses RLS. If the admin UI ever needs direct browser access, authenticated policies go here.

---

## Trust and failure modes

- **Retrieval misses.** If no section is similar enough to the query, Claude is instructed to say so and suggest emailing the director rather than hallucinate. The empty-retrieval case is explicitly handled in `buildSystemPrompt`.
- **Intent mis-classification.** The Haiku classifier is conservative by prompt, and any SDK error, malformed JSON, or unknown intent falls back to `general`. It never fails open into `emergency`. Sonnet's own system prompt additionally redirects medical emergencies to 911 as a belt-and-suspenders guard.
- **Emergency short-circuit.** Bypasses Voyage and Sonnet entirely, so a Voyage or Anthropic outage does not block the most safety-critical answer.
- **Voyage outage.** `/api/chat` throws on embed failure. No retrieval, no Sonnet call, clean 500 to the browser with a retry-friendly error message.
- **Supabase outage.** Retrieval throws; same behavior.
- **Citation integrity.** Claude is instructed to use exact section titles from the retrieved context (e.g. `[§ Illness Policy]`). A future admin-UI pass can parse these markers to verify each citation points to a real section.
- **Question-log write failure.** `logQuestion` swallows insert errors. A logging outage never surfaces to the parent or interrupts the stream.
- **Abuse bounds.** Three layers: Anthropic monthly spend cap (hard stop on cost), Origin allowlist on mutating API routes (blocks drive-by POSTs), and per-message / per-conversation size caps (blocks "stuff a giant prompt" attacks before any vendor tokens are spent).
