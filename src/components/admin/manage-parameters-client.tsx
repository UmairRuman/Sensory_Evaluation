"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createParentParameter,
  updateParentParameter,
  removeParentParameter,
  reorderParentParameters,
  createSubParameter,
  updateSubParameter,
  removeSubParameter,
  reorderSubParameters,
  previewCopyParameters,
  applyCopyParameters,
  type CopyPreview,
} from "@/lib/actions/admin-parameters";

interface AttributeItem {
  id: string;
  name: string;
  description: string | null;
  lowLabel: string;
  midLabel: string;
  highLabel: string;
  kind: "STANDARD" | "OVERALL_HEDONIC";
}
interface SectionItem {
  id: string;
  letter: string;
  name: string;
  description: string | null;
  attributes: AttributeItem[];
}

const inputClass =
  "rounded-[var(--radius-sm)] border border-border bg-surface px-3 py-2 text-sm outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-accent/30";

export function ManageParametersClient({
  categoryId,
  sections,
  otherCategories,
}: {
  categoryId: string;
  sections: SectionItem[];
  otherCategories: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(sections[0]?.id ?? null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [pending, startTransition] = useTransition();

  function refresh() {
    router.refresh();
  }

  function moveSection(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= sections.length) return;
    const ids = sections.map((s) => s.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    startTransition(async () => {
      const result = await reorderParentParameters(categoryId, ids);
      if ("error" in result) toast.error(result.error);
      else refresh();
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap justify-end gap-2">
        <button
          onClick={() => setShowCopyModal(true)}
          disabled={otherCategories.length === 0}
          className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-text-muted transition-colors hover:border-brand-primary/40 hover:text-brand-primary-strong disabled:opacity-40"
        >
          Copy parameters from another category
        </button>
        <button
          onClick={() => setShowAddSection(true)}
          className="rounded-full bg-brand-primary px-5 py-2 text-sm font-semibold text-text-on-brand shadow-sm hover:bg-brand-primary-strong"
        >
          + Add Parent Parameter
        </button>
      </div>

      {showCopyModal && (
        <CopyParametersModal
          targetCategoryId={categoryId}
          otherCategories={otherCategories}
          onClose={() => setShowCopyModal(false)}
          onApplied={() => {
            setShowCopyModal(false);
            refresh();
          }}
        />
      )}

      {showAddSection && (
        <AddSectionForm
          categoryId={categoryId}
          onDone={() => setShowAddSection(false)}
          onCreated={() => {
            setShowAddSection(false);
            refresh();
          }}
        />
      )}

      <div className="flex flex-col gap-3">
        {sections.map((section, idx) => (
          <SectionBlock
            key={section.id}
            section={section}
            index={idx}
            total={sections.length}
            onMove={(dir) => moveSection(idx, dir)}
            expanded={expandedId === section.id}
            onToggle={() => setExpandedId(expandedId === section.id ? null : section.id)}
            onChanged={refresh}
            pending={pending}
            startTransition={startTransition}
          />
        ))}
        {sections.length === 0 && <p className="text-sm text-text-muted">No parent parameters yet.</p>}
      </div>
    </div>
  );
}

function SectionBlock({
  section,
  index,
  total,
  onMove,
  expanded,
  onToggle,
  onChanged,
  pending,
  startTransition,
}: {
  section: SectionItem;
  index: number;
  total: number;
  onMove: (dir: -1 | 1) => void;
  expanded: boolean;
  onToggle: () => void;
  onChanged: () => void;
  pending: boolean;
  startTransition: (fn: () => Promise<void> | void) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(section.name);
  const [description, setDescription] = useState(section.description ?? "");
  const [showAddAttr, setShowAddAttr] = useState(false);

  function save() {
    startTransition(async () => {
      const result = await updateParentParameter({ id: section.id, name, description });
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setEditing(false);
      onChanged();
    });
  }

  function remove() {
    if (!confirm(`Remove "${section.name}"? New evaluations will no longer include it; past evaluations keep it.`)) return;
    startTransition(async () => {
      const result = await removeParentParameter(section.id);
      if ("error" in result) toast.error(result.error);
      else onChanged();
    });
  }

  function moveAttribute(attrIndex: number, dir: -1 | 1) {
    const target = attrIndex + dir;
    if (target < 0 || target >= section.attributes.length) return;
    const ids = section.attributes.map((a) => a.id);
    [ids[attrIndex], ids[target]] = [ids[target], ids[attrIndex]];
    startTransition(async () => {
      const result = await reorderSubParameters(section.id, ids);
      if ("error" in result) toast.error(result.error);
      else onChanged();
    });
  }

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface-raised shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <button onClick={onToggle} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <span className={`text-text-muted transition-transform ${expanded ? "rotate-90" : ""}`}>›</span>
          {editing ? (
            <input value={name} onChange={(e) => setName(e.target.value)} onClick={(e) => e.stopPropagation()} className={inputClass} />
          ) : (
            <span className="font-[family-name:var(--font-display)] font-semibold text-text">
              {section.letter}. {section.name}
            </span>
          )}
          <span className="text-xs text-text-muted">{section.attributes.length} sub-parameters</span>
        </button>
        <div className="flex items-center gap-1.5">
          <button onClick={() => onMove(-1)} disabled={index === 0} className="rounded-full border border-border px-2 py-1 text-xs disabled:opacity-30">
            ↑
          </button>
          <button onClick={() => onMove(1)} disabled={index === total - 1} className="rounded-full border border-border px-2 py-1 text-xs disabled:opacity-30">
            ↓
          </button>
          {editing ? (
            <>
              <button onClick={save} disabled={pending} className="rounded-full bg-brand-primary px-3.5 py-1.5 text-xs font-semibold text-text-on-brand">
                Save
              </button>
              <button onClick={() => setEditing(false)} className="rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold">
                Cancel
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} className="rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold text-text-muted hover:text-text">
                Edit
              </button>
              <button onClick={remove} className="rounded-full border border-status-danger/40 px-3.5 py-1.5 text-xs font-semibold text-status-danger hover:bg-status-danger/10">
                Remove
              </button>
            </>
          )}
        </div>
      </div>

      {editing && (
        <div className="px-5 pb-4">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Scoring guidance shown to panelists (optional)"
            rows={2}
            className={`${inputClass} w-full`}
          />
        </div>
      )}

      {expanded && (
        <div className="border-t border-border px-5 py-4">
          <div className="flex flex-col gap-2">
            {section.attributes.map((attr, idx) => (
              <AttributeRow
                key={attr.id}
                attribute={attr}
                index={idx}
                total={section.attributes.length}
                onMove={(dir) => moveAttribute(idx, dir)}
                onChanged={onChanged}
                pending={pending}
                startTransition={startTransition}
              />
            ))}
          </div>
          {showAddAttr ? (
            <AddAttributeForm
              sectionId={section.id}
              onDone={() => setShowAddAttr(false)}
              onCreated={() => {
                setShowAddAttr(false);
                onChanged();
              }}
            />
          ) : (
            <button onClick={() => setShowAddAttr(true)} className="mt-3 text-sm font-medium text-brand-primary hover:underline">
              + Add Sub-Parameter
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function AttributeRow({
  attribute,
  index,
  total,
  onMove,
  onChanged,
  pending,
  startTransition,
}: {
  attribute: AttributeItem;
  index: number;
  total: number;
  onMove: (dir: -1 | 1) => void;
  onChanged: () => void;
  pending: boolean;
  startTransition: (fn: () => Promise<void> | void) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(attribute.name);
  const [lowLabel, setLowLabel] = useState(attribute.lowLabel);
  const [midLabel, setMidLabel] = useState(attribute.midLabel);
  const [highLabel, setHighLabel] = useState(attribute.highLabel);

  function save() {
    startTransition(async () => {
      const result = await updateSubParameter({ id: attribute.id, name, lowLabel, midLabel, highLabel });
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setEditing(false);
      onChanged();
    });
  }

  function remove() {
    if (!confirm(`Remove "${attribute.name}"?`)) return;
    startTransition(async () => {
      const result = await removeSubParameter(attribute.id);
      if ("error" in result) toast.error(result.error);
      else onChanged();
    });
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-1.5 rounded-[var(--radius-sm)] border border-border bg-surface px-3 py-2.5">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className={inputClass} />
        <div className="grid grid-cols-3 gap-1.5">
          <input value={lowLabel} onChange={(e) => setLowLabel(e.target.value)} placeholder="Below target" className={inputClass} />
          <input value={midLabel} onChange={(e) => setMidLabel(e.target.value)} placeholder="Target" className={inputClass} />
          <input value={highLabel} onChange={(e) => setHighLabel(e.target.value)} placeholder="Above target" className={inputClass} />
        </div>
        <div className="flex gap-2">
          <button onClick={save} disabled={pending} className="rounded-full bg-brand-primary px-3 py-1.5 text-xs font-semibold text-text-on-brand">
            Save
          </button>
          <button onClick={() => setEditing(false)} className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-[var(--radius-sm)] border border-border px-3 py-2">
      <span className="text-sm text-text">
        {attribute.name}
        {attribute.kind === "OVERALL_HEDONIC" && (
          <span className="ml-2 rounded-full bg-brand-accent-soft px-2 py-0.5 text-[10px] font-semibold text-brand-primary-strong">Overall liking</span>
        )}
      </span>
      <div className="flex items-center gap-1.5">
        <button onClick={() => onMove(-1)} disabled={index === 0} className="rounded-full border border-border px-2 py-0.5 text-xs disabled:opacity-30">
          ↑
        </button>
        <button onClick={() => onMove(1)} disabled={index === total - 1} className="rounded-full border border-border px-2 py-0.5 text-xs disabled:opacity-30">
          ↓
        </button>
        <button onClick={() => setEditing(true)} className="text-xs font-semibold text-text-muted hover:text-text">
          Edit
        </button>
        <button onClick={remove} className="text-xs font-semibold text-status-danger hover:underline">
          Remove
        </button>
      </div>
    </div>
  );
}

function AddSectionForm({ categoryId, onDone, onCreated }: { categoryId: string; onDone: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      const result = await createParentParameter({ categoryId, name, description });
      if ("error" in result) {
        setError(result.error);
        return;
      }
      onCreated();
    });
  }

  return (
    <div className="flex flex-col gap-2 rounded-[var(--radius-lg)] border border-border bg-surface-raised p-4 shadow-sm">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Parent parameter name" className={inputClass} />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Scoring guidance shown to panelists (optional)"
        rows={2}
        className={inputClass}
      />
      {error && <p className="text-xs text-status-danger">{error}</p>}
      <div className="flex gap-2">
        <button onClick={submit} disabled={pending || !name.trim()} className="rounded-full bg-brand-primary px-4 py-1.5 text-xs font-semibold text-text-on-brand disabled:opacity-50">
          {pending ? "Adding…" : "Add"}
        </button>
        <button onClick={onDone} className="rounded-full border border-border px-4 py-1.5 text-xs font-semibold">
          Cancel
        </button>
      </div>
    </div>
  );
}

function AddAttributeForm({ sectionId, onDone, onCreated }: { sectionId: string; onDone: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [lowLabel, setLowLabel] = useState("");
  const [midLabel, setMidLabel] = useState("Target");
  const [highLabel, setHighLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      const result = await createSubParameter({ sectionId, name, lowLabel, midLabel, highLabel });
      if ("error" in result) {
        setError(result.error);
        return;
      }
      onCreated();
    });
  }

  return (
    <div className="mt-3 flex flex-col gap-1.5 rounded-[var(--radius-sm)] border border-border bg-surface px-3 py-3">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Sub-parameter name" className={inputClass} />
      <div className="grid grid-cols-3 gap-1.5">
        <input value={lowLabel} onChange={(e) => setLowLabel(e.target.value)} placeholder="Below-target descriptor" className={inputClass} />
        <input value={midLabel} onChange={(e) => setMidLabel(e.target.value)} placeholder="Target descriptor" className={inputClass} />
        <input value={highLabel} onChange={(e) => setHighLabel(e.target.value)} placeholder="Above-target descriptor" className={inputClass} />
      </div>
      {error && <p className="text-xs text-status-danger">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={submit}
          disabled={pending || !name.trim() || !lowLabel.trim() || !midLabel.trim() || !highLabel.trim()}
          className="rounded-full bg-brand-primary px-4 py-1.5 text-xs font-semibold text-text-on-brand disabled:opacity-50"
        >
          {pending ? "Adding…" : "Add"}
        </button>
        <button onClick={onDone} className="rounded-full border border-border px-4 py-1.5 text-xs font-semibold">
          Cancel
        </button>
      </div>
    </div>
  );
}

function CopyParametersModal({
  targetCategoryId,
  otherCategories,
  onClose,
  onApplied,
}: {
  targetCategoryId: string;
  otherCategories: { id: string; title: string }[];
  onClose: () => void;
  onApplied: () => void;
}) {
  const [sourceId, setSourceId] = useState(otherCategories[0]?.id ?? "");
  const [mode, setMode] = useState<"replace" | "append">("append");
  const [preview, setPreview] = useState<CopyPreview | null>(null);
  const [resolutions, setResolutions] = useState<Record<string, { action: "skip" | "rename" | "merge"; renameTo?: string }>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function loadPreview() {
    setError(null);
    startTransition(async () => {
      const result = await previewCopyParameters(sourceId, targetCategoryId, mode);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setPreview(result.preview);
      setResolutions({});
    });
  }

  function apply() {
    if (!preview) return;
    const unresolved = preview.conflicts.filter((c) => !resolutions[c.id]);
    if (unresolved.length > 0) {
      setError(`Resolve all conflicts first: ${unresolved.map((c) => c.name).join(", ")}`);
      return;
    }
    startTransition(async () => {
      const result = await applyCopyParameters({
        sourceCategoryId: sourceId,
        targetCategoryId,
        mode,
        resolutions: Object.entries(resolutions).map(([sourceParentParameterId, r]) => ({ sourceParentParameterId, ...r })),
      });
      if ("error" in result) {
        setError(result.error);
        return;
      }
      toast.success("Parameters copied.");
      onApplied();
    });
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-[var(--radius-lg)] border border-border bg-surface-raised p-6 shadow-lg">
        <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg font-semibold text-brand-primary-strong">
          Copy Parameters From Another Category
        </h2>

        <div className="flex flex-col gap-3">
          <select value={sourceId} onChange={(e) => { setSourceId(e.target.value); setPreview(null); }} className={`${inputClass} w-full`}>
            {otherCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              onClick={() => { setMode("replace"); setPreview(null); }}
              className={`flex-1 rounded-[var(--radius-sm)] border px-3 py-2 text-sm font-medium ${mode === "replace" ? "border-brand-primary bg-brand-primary-soft text-brand-primary-strong" : "border-border text-text-muted"}`}
            >
              Replace all
            </button>
            <button
              onClick={() => { setMode("append"); setPreview(null); }}
              className={`flex-1 rounded-[var(--radius-sm)] border px-3 py-2 text-sm font-medium ${mode === "append" ? "border-brand-primary bg-brand-primary-soft text-brand-primary-strong" : "border-border text-text-muted"}`}
            >
              Append
            </button>
          </div>

          {!preview && (
            <button onClick={loadPreview} disabled={pending || !sourceId} className="rounded-full border border-border py-2 text-sm font-semibold hover:bg-surface-sunken">
              {pending ? "Loading preview…" : "Preview"}
            </button>
          )}

          {preview && (
            <div className="flex flex-col gap-3 rounded-[var(--radius-sm)] border border-border bg-surface p-3">
              {mode === "replace" && preview.targetCurrentSections.length > 0 && (
                <p className="text-xs text-status-warning">
                  This will remove {preview.targetCurrentSections.length} existing parent parameter(s) from new evaluations in this category:{" "}
                  {preview.targetCurrentSections.map((s) => s.name).join(", ")}.
                </p>
              )}
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Will copy {preview.sourceSections.length} parent parameters</p>
              <ul className="flex flex-col gap-1 text-sm text-text">
                {preview.sourceSections.map((s) => (
                  <li key={s.id} className="flex items-center justify-between">
                    <span>
                      {s.name} <span className="text-text-muted">({s.subParameterCount} sub-parameters)</span>
                    </span>
                    {preview.conflicts.some((c) => c.id === s.id) && (
                      <select
                        value={resolutions[s.id]?.action ?? ""}
                        onChange={(e) =>
                          setResolutions((prev) => ({ ...prev, [s.id]: { action: e.target.value as "skip" | "rename" | "merge" } }))
                        }
                        className="rounded-[var(--radius-sm)] border border-status-warning/50 bg-status-warning/10 px-2 py-1 text-xs"
                      >
                        <option value="">Conflict — choose…</option>
                        <option value="skip">Skip</option>
                        <option value="merge">Merge into existing</option>
                        <option value="rename">Rename on copy</option>
                      </select>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error && <p className="text-sm text-status-danger">{error}</p>}

          <div className="mt-2 flex gap-2">
            {preview && (
              <button onClick={apply} disabled={pending} className="flex-1 rounded-full bg-brand-primary py-2.5 text-sm font-semibold text-text-on-brand disabled:opacity-50">
                {pending ? "Applying…" : "Apply"}
              </button>
            )}
            <button onClick={onClose} className="rounded-full border border-border px-5 py-2.5 text-sm font-medium">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
