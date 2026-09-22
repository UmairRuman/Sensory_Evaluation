"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AttributeDef {
  id: string;
  name: string;
  kind: string;
  lowLabel: string;
  midLabel: string;
  highLabel: string;
}
interface SectionDef {
  id: string;
  letter: string;
  name: string;
  attributes: AttributeDef[];
}

function scaleClass(value: number, selected: number | undefined) {
  if (selected !== value) return "border-border bg-surface text-text-muted hover:border-brand-primary/40";
  if (value <= 2) return "border-status-below bg-status-below text-white shadow-sm scale-[1.04]";
  if (value === 3) return "border-status-target bg-status-target text-white shadow-sm scale-[1.04]";
  return "border-status-above bg-status-above text-white shadow-sm scale-[1.04]";
}

export function ScoringForm({
  token,
  panelistVisitId,
  sampleId,
  sampleName,
  productName,
  sections,
  progress,
  nextHref,
}: {
  token: string;
  panelistVisitId: string;
  sampleId: string;
  sampleName: string;
  productName: string;
  sections: SectionDef[];
  progress: { current: number; total: number };
  nextHref: string;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalAttributes = useMemo(() => sections.reduce((n, s) => n + s.attributes.length, 0), [sections]);
  const scoredCount = Object.keys(scores).length;
  const section = sections[activeTab];
  const isLastTab = activeTab === sections.length - 1;

  function setScore(attributeId: string, value: number) {
    setScores((prev) => ({ ...prev, [attributeId]: value }));
  }

  function firstIncompleteSectionIndex() {
    return sections.findIndex((s) => s.attributes.some((a) => scores[a.id] === undefined));
  }

  async function submit() {
    const incompleteIdx = firstIncompleteSectionIndex();
    if (incompleteIdx !== -1) {
      setActiveTab(incompleteIdx);
      setError("Please score every attribute before submitting.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/s/${token}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ panelistVisitId, sampleId, scores, comment: comment || undefined }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      toast.success(`${sampleName} scored`);
      router.push(nextHref);
    } catch {
      setError("Network error — please check your connection and try again.");
      setSubmitting(false);
    }
  }

  const progressPct = totalAttributes === 0 ? 0 : Math.round((scoredCount / totalAttributes) * 100);

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col bg-surface pb-28">
      <header className="hero-surface sticky top-0 z-10 px-5 pb-4 pt-5 text-text-on-brand">
        <p className="font-[family-name:var(--font-display)] text-[10px] font-medium uppercase tracking-[0.18em] text-brand-accent-soft">
          {productName}
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold">{sampleName}</h1>
        <p className="mt-0.5 text-xs text-text-on-brand/75">
          Sample {progress.current} of {progress.total} · {scoredCount}/{totalAttributes} attributes scored
        </p>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-brand-accent transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </header>

      <div className="flex gap-1.5 overflow-x-auto px-4 py-3">
        {sections.map((s, idx) => {
          const done = s.attributes.every((a) => scores[a.id] !== undefined);
          return (
            <button
              key={s.id}
              onClick={() => setActiveTab(idx)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                idx === activeTab
                  ? "bg-brand-primary text-text-on-brand shadow-sm"
                  : done
                    ? "bg-brand-accent-soft text-brand-primary-strong"
                    : "bg-surface-sunken text-text-muted"
              }`}
            >
              {s.letter}. {s.name}
              {done && " ✓"}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 px-4">
        {section?.attributes.map((attr) => (
          <div key={attr.id} className="rounded-[var(--radius-md)] border border-border bg-surface-raised p-4 shadow-xs">
            <p className="mb-3 text-[15px] font-semibold text-text">{attr.name}</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  onClick={() => setScore(attr.id, v)}
                  className={`aspect-square flex-1 rounded-[var(--radius-sm)] border-2 text-base font-bold transition-all ${scaleClass(v, scores[attr.id])}`}
                >
                  {v}
                </button>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[10px] leading-snug text-text-muted">
              <span className="max-w-[32%] text-left">{attr.lowLabel}</span>
              <span className="max-w-[32%] text-center">{attr.midLabel}</span>
              <span className="max-w-[32%] text-right">{attr.highLabel}</span>
            </div>
          </div>
        ))}

        {isLastTab && (
          <div className="rounded-[var(--radius-md)] border border-border bg-surface-raised p-4 shadow-xs">
            <label htmlFor="comment" className="mb-1.5 block text-sm font-semibold text-text">
              Additional comments (optional)
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full rounded-[var(--radius-sm)] border border-border bg-surface px-3 py-2 text-sm outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-accent/40"
              placeholder="Defect observations, notes…"
            />
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-surface-raised/95 p-4 shadow-lg backdrop-blur-md">
        <div className="relative mx-auto flex max-w-lg gap-3">
          {error && <p className="absolute -top-9 left-4 right-4 text-center text-xs text-status-danger">{error}</p>}
          {!isLastTab ? (
            <button
              onClick={() => setActiveTab((t) => Math.min(t + 1, sections.length - 1))}
              className="w-full rounded-full bg-brand-primary py-3.5 text-sm font-semibold text-text-on-brand shadow-sm transition-colors hover:bg-brand-primary-strong"
            >
              Next section
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={submitting}
              className="w-full rounded-full bg-brand-primary py-3.5 text-sm font-semibold text-text-on-brand shadow-sm transition-colors hover:bg-brand-primary-strong disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit scores"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
