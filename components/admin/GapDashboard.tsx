"use client";

import { useCallback, useEffect, useState } from "react";
import type { GapCluster } from "@/app/api/admin/gaps/route";
import { GapCard } from "./GapCard";

type State =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "loaded"; clusters: GapCluster[] };

export function GapDashboard() {
  const [state, setState] = useState<State>({ kind: "loading" });

  const load = useCallback(async () => {
    setState({ kind: "loading" });
    try {
      const res = await fetch("/api/admin/gaps", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data?.error === "string" ? data.error : `failed (${res.status})`,
        );
      }
      setState({ kind: "loaded", clusters: data.clusters ?? [] });
    } catch (err) {
      setState({
        kind: "error",
        message: err instanceof Error ? err.message : "load failed",
      });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onMerged = useCallback((id: string) => {
    setState((prev) =>
      prev.kind === "loaded"
        ? { kind: "loaded", clusters: prev.clusters.filter((c) => c.id !== id) }
        : prev,
    );
  }, []);

  if (state.kind === "loading") {
    return (
      <div className="flex items-center gap-3 font-sans text-[14px] text-ink-mute">
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-clay" />
        Clustering unresolved questions and drafting proposals…
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className="rounded-md border border-clay-deep bg-cream p-6 font-sans text-[14px] text-clay-deep">
        ✗ {state.message}
        <button
          type="button"
          onClick={load}
          className="ml-3 underline hover:text-clay"
        >
          retry
        </button>
      </div>
    );
  }

  if (state.clusters.length === 0) {
    return (
      <div className="rounded-md border border-paper-edge bg-cream p-6 text-ink-soft">
        <p className="font-display text-[20px] italic">
          No gaps detected right now.
        </p>
        <p className="mt-2 font-sans text-[14px]">
          Ask the chat more questions (or run <code>just seed-questions</code>)
          and come back.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <p className="font-sans text-[13px] text-ink-soft">
        {state.clusters.length} cluster
        {state.clusters.length === 1 ? "" : "s"} of unresolved parent questions.
        Review each proposal, edit as needed, merge to publish.
      </p>
      {state.clusters.map((c) => (
        <GapCard key={c.id} cluster={c} onMerged={onMerged} />
      ))}
    </div>
  );
}
