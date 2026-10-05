"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  deleteEvaluations,
  previewDeletion,
  removeScoreFromSubmission,
  type DeletionScope,
  type DeletionPreview,
} from "@/lib/actions/admin-deletions";
import { fetchSubmissionScores } from "@/lib/actions/admin-evaluations-query";

interface SubmissionRow {
  id: string;
  panelistName: string;
  categoryTitle: string;
  productName: string;
  sessionId: string;
  sessionName: string;
  sampleName: string;
  submittedAt: string;
}
interface InProcessRow {
  id: string;
  panelistName: string;
  categoryTitle: string;
  sessionId: string;
  sessionName: string;
  joinedAt: string;
  submittedCount: number;
  totalSamples: number;
}

const inputClass =
  "rounded-[var(--radius-sm)] border border-border bg-surface-raised px-3 py-2 text-sm outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-accent/30";

export function EvaluationRecordsClient({
  categories,
  products,
  filters,
  submissions,
  inProcessVisits,
}: {
  categories: { id: string; title: string }[];
  products: { id: string; name: string; categoryId: string }[];
  filters: { categoryId: string; productId: string; from: string; to: string };
  submissions: SubmissionRow[];
  inProcessVisits: InProcessRow[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pendingScope, setPendingScope] = useState<{ scope: DeletionScope; label: string } | null>(null);
  const [manageSubmissionId, setManageSubmissionId] = useState<string | null>(null);

  const allSelected = submissions.length > 0 && submissions.every((s) => selected.has(s.id));

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(submissions.map((s) => s.id)));
  }
  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const distinctSessions = useMemo(() => {
    const map = new Map<string, string>();
    submissions.forEach((s) => map.set(s.sessionId, s.sessionName));
    return [...map.entries()];
  }, [submissions]);
  const distinctProducts = useMemo(() => {
    const map = new Map<string, string>();
    submissions.forEach((s) => map.set(s.productName, s.productName));
    return [...map.keys()];
  }, [submissions]);

  return (
    <div className="flex flex-col gap-6">
      <form method="GET" className="flex flex-wrap items-center gap-2.5 rounded-[var(--radius-lg)] border border-border bg-surface-raised p-3 shadow-sm">
        <select name="categoryId" defaultValue={filters.categoryId} className={inputClass}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
        <select name="productId" defaultValue={filters.productId} className={inputClass}>
          <option value="">All SKUs</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <input type="date" name="from" defaultValue={filters.from} className={inputClass} />
        <input type="date" name="to" defaultValue={filters.to} className={inputClass} />
        <button type="submit" className="rounded-[var(--radius-sm)] bg-brand-primary-soft px-4 py-2 text-sm font-semibold text-brand-primary-strong">
          Filter
        </button>
      </form>

      {selected.size > 0 && (
        <div className="flex items-center justify-between rounded-[var(--radius-sm)] border border-status-danger/30 bg-status-danger/5 px-4 py-2.5">
          <span className="text-sm text-text">{selected.size} selected</span>
          <button
            onClick={() => setPendingScope({ scope: { kind: "submissions", submissionIds: [...selected] }, label: `${selected.size} selected evaluation(s)` })}
            className="rounded-full bg-status-danger px-4 py-1.5 text-xs font-semibold text-white"
          >
            Delete selected
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface-raised shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-sunken/60 text-left text-[11px] font-semibold uppercase tracking-wide text-text-muted">
              <th className="py-3 pl-5 pr-2">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} />
              </th>
              <th className="py-3 pr-3">Date</th>
              <th className="py-3 pr-3">Category</th>
              <th className="py-3 pr-3">SKU</th>
              <th className="py-3 pr-3">Sample</th>
              <th className="py-3 pr-3">Session</th>
              <th className="py-3 pr-3">Panelist</th>
              <th className="py-3 pr-3">Status</th>
              <th className="py-3 pr-5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s) => (
              <tr key={s.id} className="border-t border-border">
                <td className="py-2.5 pl-5 pr-2">
                  <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggleOne(s.id)} />
                </td>
                <td className="py-2.5 pr-3 text-text-muted">{new Date(s.submittedAt).toLocaleDateString()}</td>
                <td className="py-2.5 pr-3 text-text-muted">{s.categoryTitle}</td>
                <td className="py-2.5 pr-3 text-text">{s.productName}</td>
                <td className="py-2.5 pr-3 text-text-muted">{s.sampleName}</td>
                <td className="py-2.5 pr-3 text-text-muted">{s.sessionName}</td>
                <td className="py-2.5 pr-3 text-text-muted">{s.panelistName}</td>
                <td className="py-2.5 pr-3">
                  <span className="rounded-full bg-status-target/15 px-2 py-0.5 text-[11px] font-semibold text-status-target">Completed</span>
                </td>
                <td className="py-2.5 pr-5">
                  <div className="flex gap-2">
                    <button onClick={() => setManageSubmissionId(s.id)} className="text-xs font-semibold text-text-muted hover:text-text">
                      Parameters
                    </button>
                    <button
                      onClick={() => setPendingScope({ scope: { kind: "submissions", submissionIds: [s.id] }, label: `this evaluation (${s.panelistName} · ${s.sampleName})` })}
                      className="text-xs font-semibold text-status-danger hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {inProcessVisits.map((v) => (
              <tr key={v.id} className="border-t border-border bg-surface-sunken/20">
                <td className="py-2.5 pl-5 pr-2" />
                <td className="py-2.5 pr-3 text-text-muted">{new Date(v.joinedAt).toLocaleDateString()}</td>
                <td className="py-2.5 pr-3 text-text-muted">{v.categoryTitle}</td>
                <td className="py-2.5 pr-3 text-text-muted" colSpan={2}>
                  {v.submittedCount}/{v.totalSamples} samples scored
                </td>
                <td className="py-2.5 pr-3 text-text-muted">{v.sessionName}</td>
                <td className="py-2.5 pr-3 text-text-muted">{v.panelistName}</td>
                <td className="py-2.5 pr-3">
                  <span className="rounded-full bg-status-warning/15 px-2 py-0.5 text-[11px] font-semibold text-status-warning">In process</span>
                </td>
                <td className="py-2.5 pr-5">
                  <button
                    onClick={() => setPendingScope({ scope: { kind: "panelistVisit", panelistVisitId: v.id }, label: `this in-process visit (${v.panelistName})` })}
                    className="text-xs font-semibold text-status-danger hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {submissions.length === 0 && inProcessVisits.length === 0 && (
              <tr>
                <td colSpan={9} className="px-5 py-10 text-center text-text-muted">
                  No evaluation records match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {(distinctSessions.length > 0 || distinctProducts.length > 0) && (
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface-raised p-4 shadow-sm">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Bulk delete by scope</p>
          <div className="flex flex-wrap gap-2">
            {distinctSessions.map(([id, name]) => (
              <button
                key={id}
                onClick={() => setPendingScope({ scope: { kind: "session", sessionId: id }, label: `the entire session "${name}"` })}
                className="rounded-full border border-status-danger/40 px-3 py-1.5 text-xs font-semibold text-status-danger hover:bg-status-danger/10"
              >
                Delete session: {name}
              </button>
            ))}
          </div>
        </div>
      )}

      {manageSubmissionId && (
        <ManageSubmissionParametersModal submissionId={manageSubmissionId} onClose={() => setManageSubmissionId(null)} onChanged={() => router.refresh()} />
      )}

      {pendingScope && (
        <DeleteConfirmModal
          scope={pendingScope.scope}
          label={pendingScope.label}
          onClose={() => setPendingScope(null)}
          onDeleted={() => {
            setPendingScope(null);
            setSelected(new Set());
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function DeleteConfirmModal({
  scope,
  label,
  onClose,
  onDeleted,
}: {
  scope: DeletionScope;
  label: string;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [preview, setPreview] = useState<DeletionPreview | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const result = await previewDeletion(scope);
      if ("error" in result) setError(result.error);
      else setPreview(result.preview);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function confirmDelete() {
    startTransition(async () => {
      const result = await deleteEvaluations(scope, confirmText);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      toast.success(`Deleted ${result.deletedCount} evaluation(s).`);
      onDeleted();
    });
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-[var(--radius-lg)] border border-status-danger/40 bg-surface-raised p-6 shadow-lg">
        <h2 className="mb-2 font-[family-name:var(--font-display)] text-lg font-semibold text-status-danger">Permanently delete {label}?</h2>
        <p className="mb-4 text-sm text-text-muted">This cannot be undone. The records, their scores, and any remarks will be removed entirely.</p>

        {preview && (
          <div className="mb-4 rounded-[var(--radius-sm)] border border-border bg-surface px-3 py-2.5 text-sm">
            <p>
              <span className="font-semibold">{preview.submissionCount}</span> evaluation(s) from{" "}
              <span className="font-semibold">{preview.panelistVisitCount}</span> panelist visit(s)
            </p>
            {preview.productNames.length > 0 && <p className="mt-1 text-text-muted">SKUs: {preview.productNames.join(", ")}</p>}
            {preview.dateRange.earliest && (
              <p className="mt-1 text-text-muted">
                {new Date(preview.dateRange.earliest).toLocaleDateString()} – {new Date(preview.dateRange.latest!).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-muted">
          Type <span className="font-mono">DELETE</span> to confirm
        </label>
        <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} className={`${inputClass} w-full`} />

        {error && <p className="mt-2 text-sm text-status-danger">{error}</p>}

        <div className="mt-4 flex gap-2">
          <button
            onClick={confirmDelete}
            disabled={pending || confirmText !== "DELETE"}
            className="flex-1 rounded-full bg-status-danger py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {pending ? "Deleting…" : "Permanently delete"}
          </button>
          <button onClick={onClose} className="rounded-full border border-border px-5 py-2.5 text-sm font-medium">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function ManageSubmissionParametersModal({ submissionId, onClose, onChanged }: { submissionId: string; onClose: () => void; onChanged: () => void }) {
  const [scores, setScores] = useState<{ attributeId: string; name: string; value: number }[] | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const result = await fetchSubmissionScores(submissionId);
      if ("ok" in result) setScores(result.scores);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function remove(attributeId: string) {
    startTransition(async () => {
      const result = await removeScoreFromSubmission(submissionId, attributeId);
      if ("ok" in result) {
        setScores((prev) => prev?.filter((s) => s.attributeId !== attributeId) ?? null);
        onChanged();
      }
    });
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-[var(--radius-lg)] border border-border bg-surface-raised p-6 shadow-lg">
        <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg font-semibold text-brand-primary-strong">Remove individual parameters</h2>
        <p className="mb-3 text-xs text-text-muted">Removes just this parameter&apos;s score, leaving the rest of the evaluation intact.</p>
        <div className="flex flex-col gap-1.5">
          {scores?.map((s) => (
            <div key={s.attributeId} className="flex items-center justify-between rounded-[var(--radius-sm)] border border-border px-3 py-2 text-sm">
              <span>
                {s.name} <span className="text-text-muted">({s.value})</span>
              </span>
              <button onClick={() => remove(s.attributeId)} disabled={pending} className="text-xs font-semibold text-status-danger hover:underline">
                Remove
              </button>
            </div>
          ))}
          {scores?.length === 0 && <p className="text-sm text-text-muted">No parameters remain on this evaluation.</p>}
        </div>
        <button onClick={onClose} className="mt-4 rounded-full border border-border px-5 py-2.5 text-sm font-medium">
          Close
        </button>
      </div>
    </div>
  );
}
