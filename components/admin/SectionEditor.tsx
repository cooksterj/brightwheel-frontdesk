"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import type { SectionRow } from "@/lib/handbook/repo";

interface Props {
  initial: SectionRow;
}

export function SectionEditor({ initial }: Props) {
  const [title, setTitle] = useState(initial.title);
  const [body, setBody] = useState(initial.body);
  const [version, setVersion] = useState(initial.version);
  const [updatedAt, setUpdatedAt] = useState(initial.updated_at);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  const isDirty = title !== initial.title || body !== initial.body;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isDirty || saving) return;
    setSaving(true);
    setError(null);
    setJustSaved(false);
    try {
      const res = await fetch(`/api/admin/handbook/${initial.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data?.error === "string"
            ? data.error
            : `save failed (${res.status})`,
        );
      }
      // Merge server-returned state so dirty flag resets correctly.
      initial.title = data.title;
      initial.body = data.body;
      setTitle(data.title);
      setBody(data.body);
      setVersion(data.version);
      setUpdatedAt(data.updated_at);
      setJustSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/handbook"
          className="font-sans text-[12px] uppercase tracking-[0.28em] text-ink-mute hover:text-ink"
        >
          ← All sections
        </Link>
        <div className="font-sans text-[12px] text-ink-mute">
          v{version} · last edited {new Date(updatedAt).toLocaleString()}
        </div>
      </div>

      <label className="flex flex-col gap-2">
        <span className="font-sans text-[11px] uppercase tracking-[0.28em] text-ink-mute">
          Title
        </span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          className="rounded-md border border-paper-edge bg-cream px-4 py-2.5 font-display text-[22px] tracking-tight text-ink focus:border-clay focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="font-sans text-[11px] uppercase tracking-[0.28em] text-ink-mute">
          Body (Markdown)
        </span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={28}
          className="rounded-md border border-paper-edge bg-cream px-4 py-3 font-mono text-[13px] leading-[1.55] text-ink focus:border-clay focus:outline-none"
        />
      </label>

      <div className="flex items-center justify-between">
        <div aria-live="polite" className="font-sans text-[13px]">
          {error ? (
            <span className="text-clay-deep">✗ {error}</span>
          ) : justSaved && !isDirty ? (
            <span className="text-sage">✓ Saved — parents will see changes on the next chat query.</span>
          ) : isDirty ? (
            <span className="text-ink-mute">Unsaved changes.</span>
          ) : (
            <span className="text-ink-mute">No changes yet.</span>
          )}
        </div>
        <button
          type="submit"
          disabled={!isDirty || saving}
          className="inline-flex items-center gap-2 rounded-full bg-clay px-7 py-3 font-sans text-[12px] uppercase tracking-[0.22em] text-paper transition-colors hover:bg-clay-deep disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
          <span aria-hidden>→</span>
        </button>
      </div>
    </form>
  );
}
