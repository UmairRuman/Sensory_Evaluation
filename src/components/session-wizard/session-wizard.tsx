"use client";

import { useMemo, useState, useTransition } from "react";
import type { Category } from "@prisma/client";
import { fetchCategoryMasterfile } from "@/lib/actions/masterfile";
import { createAndPublishSession } from "@/lib/actions/sessions";
import type { CategoryMasterfile } from "@/lib/masterfile/queries";
import { attributeAppliesToProduct } from "@/lib/masterfile/applicability";

const REGIONS = ["Central", "North-1", "North II", "South"];
const ENTITIES = ["ARF/QIE/MDK", "ATA", "DFF"];
const EVAL_TYPES = [
  { value: "COMPETITIVE_BENCHMARK", label: "Competitive Benchmarking" },
  { value: "NPD", label: "New Product Development" },
  { value: "ROUTINE_QC", label: "Routine QC" },
] as const;

type EvalType = (typeof EVAL_TYPES)[number]["value"];

interface SampleDraft {
  sampleName: string;
  sampleCode: string;
  brandName: string;
  batchNo: string;
  plantLine: string;
}

interface ProductSelection {
  productId: string;
  productName: string;
  samples: SampleDraft[];
}

function defaultSamples(): SampleDraft[] {
  return [
    { sampleName: "Sample A", sampleCode: "A", brandName: "", batchNo: "", plantLine: "" },
    { sampleName: "Sample B", sampleCode: "B", brandName: "", batchNo: "", plantLine: "" },
  ];
}

export function SessionWizard({ categories }: { categories: Category[] }) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [masterfile, setMasterfile] = useState<CategoryMasterfile | null>(null);
  const [loadingMasterfile, setLoadingMasterfile] = useState(false);

  const [selectedProducts, setSelectedProducts] = useState<ProductSelection[]>([]);
  const [disabledAttributeIds, setDisabledAttributeIds] = useState<Set<string>>(new Set());

  const [sessionName, setSessionName] = useState("");
  const [evaluationType, setEvaluationType] = useState<EvalType>("COMPETITIVE_BENCHMARK");
  const [region, setRegion] = useState("");
  const [entity, setEntity] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function chooseCategory(cat: Category) {
    setError(null);
    setCategoryId(cat.id);
    setLoadingMasterfile(true);
    const data = await fetchCategoryMasterfile(cat.id);
    setMasterfile(data);
    setLoadingMasterfile(false);
    setSelectedProducts([]);
    setSessionName((prev) => prev || `${cat.title} Evaluation`);
    setStep(2);
  }

  function toggleProduct(productId: string, productName: string) {
    setSelectedProducts((prev) => {
      const exists = prev.find((p) => p.productId === productId);
      if (exists) return prev.filter((p) => p.productId !== productId);
      return [...prev, { productId, productName, samples: defaultSamples() }];
    });
  }

  function updateSample(productId: string, index: number, patch: Partial<SampleDraft>) {
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.productId !== productId
          ? p
          : { ...p, samples: p.samples.map((s, i) => (i === index ? { ...s, ...patch } : s)) }
      )
    );
  }

  function addSample(productId: string) {
    setSelectedProducts((prev) =>
      prev.map((p) => {
        if (p.productId !== productId) return p;
        const nextLetter = String.fromCharCode(65 + p.samples.length);
        return {
          ...p,
          samples: [
            ...p.samples,
            { sampleName: `Sample ${nextLetter}`, sampleCode: nextLetter, brandName: "", batchNo: "", plantLine: "" },
          ],
        };
      })
    );
  }

  function removeSample(productId: string, index: number) {
    setSelectedProducts((prev) =>
      prev.map((p) => (p.productId !== productId ? p : { ...p, samples: p.samples.filter((_, i) => i !== index) }))
    );
  }

  const applicableSections = useMemo(() => {
    if (!masterfile) return [];
    const productIds = selectedProducts.map((p) => p.productId);
    return masterfile.sections
      .map((section) => ({
        ...section,
        attributes: section.attributes.filter((attr) => productIds.some((pid) => attributeAppliesToProduct(attr, pid))),
      }))
      .filter((section) => section.attributes.length > 0);
  }, [masterfile, selectedProducts]);

  function toggleAttribute(attributeId: string, kind: string) {
    if (kind === "OVERALL_HEDONIC") return; // always required
    setDisabledAttributeIds((prev) => {
      const next = new Set(prev);
      if (next.has(attributeId)) next.delete(attributeId);
      else next.add(attributeId);
      return next;
    });
  }

  function goToReview() {
    if (!sessionName.trim()) {
      setError("Give this session a name before continuing.");
      return;
    }
    if (selectedProducts.some((p) => p.samples.length === 0)) {
      setError("Every selected product needs at least one sample.");
      return;
    }
    setError(null);
    setStep(4);
  }

  function publish() {
    if (!categoryId) return;
    setError(null);
    startTransition(async () => {
      const result = await createAndPublishSession({
        name: sessionName.trim(),
        categoryId,
        evaluationType,
        region: region || undefined,
        entity: entity || undefined,
        products: selectedProducts.map((p) => ({
          productId: p.productId,
          samples: p.samples.map((s) => ({
            sampleName: s.sampleName,
            sampleCode: s.sampleCode,
            brandName: s.brandName || undefined,
            batchNo: s.batchNo || undefined,
            plantLine: s.plantLine || undefined,
          })),
        })),
        disabledAttributeIds: Array.from(disabledAttributeIds),
      });
      // On success this throws a redirect and never returns; on failure it resolves with { error }.
      if (result && "error" in result) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="mx-auto max-w-3xl">
      <StepTabs step={step} />

      {error && (
        <div className="mb-4 rounded-[var(--radius-sm)] border border-status-danger/40 bg-status-danger/10 px-4 py-3 text-sm text-status-danger">
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => chooseCategory(cat)}
              disabled={loadingMasterfile}
              className="group flex items-start gap-3.5 rounded-[var(--radius-md)] border border-border bg-surface-raised p-5 text-left shadow-xs transition-all hover:-translate-y-0.5 hover:border-brand-primary/50 hover:shadow-md disabled:opacity-60 disabled:hover:translate-y-0"
            >
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-primary-soft text-sm font-semibold text-brand-primary-strong transition-colors group-hover:bg-brand-primary group-hover:text-text-on-brand">
                {cat.title.charAt(0)}
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="font-[family-name:var(--font-display)] text-[15px] font-semibold text-brand-primary-strong">
                  {cat.title}
                </span>
                <span className="text-xs text-text-muted">Select this product category</span>
              </span>
            </button>
          ))}
        </div>
      )}

      {step === 2 && masterfile && (
        <div className="flex flex-col gap-5">
          <div className="grid gap-2 sm:grid-cols-2">
            {masterfile.products.map((product) => {
              const selected = selectedProducts.some((p) => p.productId === product.id);
              return (
                <button
                  key={product.id}
                  onClick={() => toggleProduct(product.id, product.name)}
                  className={`flex items-center justify-between rounded-[var(--radius-sm)] border px-4 py-3 text-left text-sm font-medium transition-colors ${
                    selected
                      ? "border-brand-primary bg-brand-primary-soft text-brand-primary-strong"
                      : "border-border bg-surface-raised text-text hover:border-brand-primary/50 hover:bg-brand-primary-soft/30"
                  }`}
                >
                  {product.name}
                  <span
                    className={`ml-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] ${
                      selected ? "border-brand-primary bg-brand-primary text-text-on-brand" : "border-border-strong"
                    }`}
                  >
                    {selected ? "✓" : ""}
                  </span>
                </button>
              );
            })}
          </div>

          {selectedProducts.map((product) => (
            <div key={product.productId} className="rounded-[var(--radius-md)] border border-border bg-surface-raised p-4 shadow-xs">
              <h3 className="font-[family-name:var(--font-display)] text-base font-semibold text-brand-primary-strong">
                {product.productName} — samples
              </h3>
              <div className="mt-3 flex flex-col gap-2">
                {product.samples.map((sample, idx) => (
                  <div key={idx} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2">
                    <input
                      value={sample.sampleName}
                      onChange={(e) => updateSample(product.productId, idx, { sampleName: e.target.value })}
                      placeholder="Sample name"
                      className="rounded-[var(--radius-sm)] border border-border bg-surface px-2.5 py-2 text-sm outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-accent/30"
                    />
                    <input
                      value={sample.sampleCode}
                      onChange={(e) => updateSample(product.productId, idx, { sampleCode: e.target.value })}
                      placeholder="Code"
                      className="rounded-[var(--radius-sm)] border border-border bg-surface px-2.5 py-2 text-sm outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-accent/30"
                    />
                    <input
                      value={sample.brandName}
                      onChange={(e) => updateSample(product.productId, idx, { brandName: e.target.value })}
                      placeholder="Brand / source (optional)"
                      className="rounded-[var(--radius-sm)] border border-border bg-surface px-2.5 py-2 text-sm outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-accent/30"
                    />
                    <button
                      onClick={() => removeSample(product.productId, idx)}
                      className="rounded-[var(--radius-sm)] px-2 text-status-danger hover:bg-status-danger/10"
                      aria-label="Remove sample"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => addSample(product.productId)}
                className="mt-3 text-sm font-medium text-brand-primary hover:underline"
              >
                + Add sample
              </button>
            </div>
          ))}

          <WizardNav
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
            nextDisabled={selectedProducts.length === 0}
          />
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Session name">
              <input
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                className="rounded-[var(--radius-sm)] border border-border bg-surface-raised px-3 py-2 text-sm outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-accent/30"
              />
            </Field>
            <Field label="Evaluation type">
              <select
                value={evaluationType}
                onChange={(e) => setEvaluationType(e.target.value as EvalType)}
                className="rounded-[var(--radius-sm)] border border-border bg-surface-raised px-3 py-2 text-sm outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-accent/30"
              >
                {EVAL_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Region (optional)">
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="rounded-[var(--radius-sm)] border border-border bg-surface-raised px-3 py-2 text-sm outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-accent/30"
              >
                <option value="">—</option>
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Entity (optional)">
              <select
                value={entity}
                onChange={(e) => setEntity(e.target.value)}
                className="rounded-[var(--radius-sm)] border border-border bg-surface-raised px-3 py-2 text-sm outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-accent/30"
              >
                <option value="">—</option>
                {ENTITIES.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div>
            <h3 className="mb-2 font-[family-name:var(--font-display)] text-sm uppercase tracking-wide text-text-muted">
              Customize parameters
            </h3>
            <div className="flex flex-col gap-4">
              {applicableSections.map((section) => (
                <div key={section.id} className="rounded-[var(--radius-md)] border border-border bg-surface-raised p-4 shadow-xs">
                  <p className="mb-2 font-[family-name:var(--font-display)] font-semibold text-brand-primary-strong">
                    {section.letter}. {section.name}
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {section.attributes.map((attr) => {
                      const disabled = disabledAttributeIds.has(attr.id);
                      const locked = attr.kind === "OVERALL_HEDONIC";
                      return (
                        <label
                          key={attr.id}
                          className={`flex items-center justify-between rounded-[var(--radius-sm)] px-2 py-1.5 text-sm ${
                            disabled ? "opacity-50" : ""
                          }`}
                        >
                          <span>
                            {attr.name}
                            {locked && <span className="ml-1.5 text-[11px] text-text-muted">(always included)</span>}
                          </span>
                          <input
                            type="checkbox"
                            checked={!disabled}
                            disabled={locked}
                            onChange={() => toggleAttribute(attr.id, attr.kind)}
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <WizardNav onBack={() => setStep(2)} onNext={goToReview} />
        </div>
      )}

      {step === 4 && (
        <div className="flex flex-col gap-5">
          <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface-raised shadow-sm">
            <div className="border-b border-border bg-brand-primary-soft/40 px-6 py-5">
              <p className="font-[family-name:var(--font-display)] text-xl font-semibold text-brand-primary-strong">
                {sessionName}
              </p>
              <p className="mt-1 text-sm text-text-muted">
                {masterfile?.title} · {EVAL_TYPES.find((t) => t.value === evaluationType)?.label}
                {region ? ` · ${region}` : ""}
                {entity ? ` · ${entity}` : ""}
              </p>
            </div>

            <div className="grid grid-cols-3 divide-x divide-border border-b border-border text-center">
              <ReviewStat value={selectedProducts.length} label="Products" />
              <ReviewStat
                value={selectedProducts.reduce((n, p) => n + p.samples.length, 0)}
                label="Samples"
              />
              <ReviewStat
                value={applicableSections.reduce((n, s) => n + s.attributes.length, 0) - disabledAttributeIds.size}
                label="Attributes"
              />
            </div>

            <ul className="flex flex-col divide-y divide-border">
              {selectedProducts.map((p) => (
                <li key={p.productId} className="flex items-center justify-between px-6 py-3 text-sm">
                  <span className="font-medium text-text">{p.productName}</span>
                  <span className="text-text-muted">
                    {p.samples.length} sample{p.samples.length === 1 ? "" : "s"} · {p.samples.map((s) => s.sampleCode).join(", ")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <WizardNav onBack={() => setStep(3)} onNext={publish} nextLabel={pending ? "Publishing…" : "Publish session"} nextDisabled={pending} />
        </div>
      )}
    </div>
  );
}

function StepTabs({ step }: { step: 1 | 2 | 3 | 4 }) {
  const labels = ["Product", "SKUs & samples", "Parameters", "Publish"];
  return (
    <div className="mb-8">
      <div className="relative flex justify-between">
        <div className="absolute left-4 right-4 top-4 h-0.5 bg-border" />
        <div
          className="absolute left-4 top-4 h-0.5 bg-brand-primary transition-all duration-300"
          style={{ width: `calc((100% - 2rem) * ${(step - 1) / (labels.length - 1)})` }}
        />
        {labels.map((label, idx) => {
          const n = (idx + 1) as 1 | 2 | 3 | 4;
          const active = n === step;
          const done = n < step;
          return (
            <div key={label} className="relative flex flex-col items-center gap-1.5">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  active
                    ? "bg-brand-primary text-text-on-brand shadow-sm"
                    : done
                      ? "bg-brand-accent text-brand-primary-strong"
                      : "border border-border bg-surface-raised text-text-muted"
                }`}
              >
                {done ? "✓" : idx + 1}
              </span>
              <span
                className={`hidden text-center text-[11px] font-medium sm:block ${
                  active ? "text-brand-primary-strong" : "text-text-muted"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WizardNav({
  onBack,
  onNext,
  nextLabel = "Continue",
  nextDisabled = false,
}: {
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <button
        onClick={onBack}
        className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-text transition-colors hover:bg-surface-sunken"
      >
        Back
      </button>
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className="rounded-full bg-brand-primary px-5 py-2.5 text-sm font-semibold text-text-on-brand shadow-sm transition-colors hover:bg-brand-primary-strong disabled:opacity-50"
      >
        {nextLabel}
      </button>
    </div>
  );
}

function ReviewStat({ value, label }: { value: number; label: string }) {
  return (
    <div className="px-2 py-4">
      <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-brand-primary-strong">{value}</p>
      <p className="mt-0.5 text-[11px] uppercase tracking-wide text-text-muted">{label}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-text-muted">{label}</span>
      {children}
    </label>
  );
}
