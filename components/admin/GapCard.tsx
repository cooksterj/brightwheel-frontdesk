"use client";

import Link from "next/link";
import { useState } from "react";
import type { GapCluster } from "@/app/api/admin/gaps/route";
import { ConfidenceBadge } from "./ConfidenceBadge";

type Status =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "error"; message: string }
  | { kind: "merged"; slug: string };

export function GapCard({
  cluster,
  onMerged,
}: {
  cluster: GapCluster;
  onMerged: (id: string) => void;
}) {
  const [title, setTitle] = useState(cluster.proposal.proposedTitle);
  const [body, setBody] = useState(cluster.proposal.proposedBody);
  const [showAll, setShowAll] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const visibleQuestions = showAll
    ? cluster.questions
    : cluster.questions.slice(0, 3);

  const onMerge = async () => {
    if (status.kind === "saving") return;
    setStatus({ kind: "saving" });
    try {
      const res = await fetch("/api/admin/gaps/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          body,
          questionIds: cluster.questions.map((q) => q.id),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data?.error === "string" ? data.error : `failed (${res.status})`,
        );
      }
      setStatus({ kind: "merged", slug: data.section.slug });
      // give the "merged" banner a beat to render, then remove the card
      setTimeout(() => onMerged(cluster.id), 800);
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "merge failed",
      });
    }
  };

  if (status.kind === "merged") {
    return (
      <div className="rounded-md border border-sage bg-cream p-6 text-ink">
        <p className="font-display text-[20px]">
          ✓ Merged as{" "}
          <Link
            href={`/admin/handbook/${status.slug}`}
            className="text-clay hover:text-clay-deep"
          >
            {title}
          </Link>
          .
        </p>
        <p className="mt-1 font-sans text-[14px] text-ink-soft">
          {cluster.questions.length} parent question
          {cluster.questions.length === 1 ? "" : "s"} marked resolved.
        </p>
      </div>
    );
  }

  return (
    <article className="flex flex-col gap-6 rounded-md border border-paper-edge bg-cream p-6">
      {/* header */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="font-sans text-[11px] uppercase tracking-[0.28em] text-clay">
            {cluster.proposal.topic}
          </p>
          <h2 className="mt-1 font-display text-[26px] leading-tight tracking-tight text-ink">
            {cluster.size} parent{cluster.size === 1 ? "" : "s"} asked about this
          </h2>
        </div>
      </header>

      {/* sample questions */}
      <div>
        <p className="mb-2 font-sans text-[11px] uppercase tracking-[0.28em] text-ink-mute">
          Questions
        </p>
        <ul className="flex flex-col gap-1.5 font-sans text-[14px] text-ink">
          {visibleQuestions.map((q) => (
            <li key={q.id} className="flex gap-3">
              <span className="text-ink-mute">›</span>
              <span className="flex-1">{q.query}</span>
              <ConfidenceBadge confidence={q.confidence} />
            </li>
          ))}
        </ul>
        {cluster.questions.length > 3 ? (
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="mt-2 font-sans text-[12px] uppercase tracking-[0.22em] text-clay hover:text-clay-deep"
          >
            {showAll ? "show fewer" : `show all ${cluster.questions.length}`}
          </button>
        ) : null}
      </div>

      {/* proposal editor */}
      <div className="flex flex-col gap-3 border-t border-paper-edge pt-4">
        <p className="font-sans text-[11px] uppercase tracking-[0.28em] text-ink-mute">
          Proposed new section
        </p>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          className="rounded-md border border-paper-edge bg-paper px-3 py-2 font-display text-[22px] tracking-tight text-ink focus:border-clay focus:outline-none"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={8}
          className="rounded-md border border-paper-edge bg-paper px-3 py-2 font-mono text-[13px] leading-[1.55] text-ink focus:border-clay focus:outline-none"
        />
      </div>

      {/* actions */}
      <footer className="flex items-center justify-between">
        <div aria-live="polite" className="font-sans text-[13px]">
          {status.kind === "error" ? (
            <span className="text-clay-deep">✗ {status.message}</span>
          ) : status.kind === "saving" ? (
            <span className="text-ink-mute">Saving…</span>
          ) : (
            <span className="text-ink-mute">
              Edit before merging — this becomes a live handbook section.
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onMerge}
          disabled={status.kind === "saving" || !title.trim() || !body.trim()}
          className="inline-flex items-center gap-2 rounded-full bg-clay px-6 py-3 font-sans text-[12px] uppercase tracking-[0.22em] text-paper transition-colors hover:bg-clay-deep disabled:cursor-not-allowed disabled:opacity-50"
        >
          Merge as handbook section
          <span aria-hidden>→</span>
        </button>
      </footer>
    </article>
  );
}
