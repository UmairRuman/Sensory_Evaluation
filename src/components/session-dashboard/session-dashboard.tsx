"use client";

import useSWR from "swr";
import { useState, useTransition } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { toast } from "sonner";
import type { SessionAggregate, SectionTargetScore } from "@/lib/scoring/aggregate";
import type { ProductVerdict } from "@/lib/scoring/narrative";
import { closeSession } from "@/lib/actions/sessions";

const SAMPLE_COLORS = ["#7A1F2B", "#C8983A", "#2F7A4F", "#3B6E91", "#8B5FA6", "#B1502F"];

type AggregateResponse = { aggregate: SessionAggregate; verdicts: Record<string, ProductVerdict> };

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function SessionDashboard({
  sessionId,
  initialData,
  status,
}: {
  sessionId: string;
  initialData: AggregateResponse;
  status: "DRAFT" | "ACTIVE" | "CLOSED";
}) {
  const { data } = useSWR<AggregateResponse>(`/api/sessions/${sessionId}/aggregate`, fetcher, {
    fallbackData: initialData,
    refreshInterval: status === "CLOSED" ? 0 : 6000,
    revalidateOnFocus: status !== "CLOSED",
  });
  const [closing, startClosing] = useTransition();
  const [localStatus, setLocalStatus] = useState(status);

  const aggregate = data?.aggregate ?? initialData.aggregate;
  const verdicts = data?.verdicts ?? initialData.verdicts;

  function handleClose() {
    startClosing(async () => {
      await closeSession(sessionId);
      setLocalStatus("CLOSED");
      toast.success("Session closed — panelists can no longer submit.");
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-border bg-surface-raised px-5 py-4 shadow-sm">
        <div className="flex items-center gap-8">
          <Stat label="Panelists" value={aggregate.totalPanelists} />
          <Stat label="Submissions" value={aggregate.totalSubmissions} />
          {localStatus !== "CLOSED" && (
            <span className="hidden items-center gap-1.5 text-xs text-text-muted sm:flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-target opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-status-target" />
              </span>
              Live
            </span>
          )}
        </div>
        {localStatus === "ACTIVE" && (
          <button
            onClick={handleClose}
            disabled={closing}
            className="rounded-full border border-status-danger/50 px-4 py-2 text-sm font-semibold text-status-danger transition-colors hover:bg-status-danger/10 disabled:opacity-50"
          >
            {closing ? "Closing…" : "Close session"}
          </button>
        )}
        {localStatus === "CLOSED" && (
          <span className="rounded-full bg-surface-sunken px-3.5 py-1.5 text-xs font-semibold text-text-muted">
            Closed — read only
          </span>
        )}
      </div>

      {aggregate.products.map((product) => (
        <ProductPanel
          key={product.sessionProductId}
          product={product}
          verdict={verdicts[product.sessionProductId]}
        />
      ))}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="font-[family-name:var(--font-display)] text-2xl font-semibold leading-none text-brand-primary-strong">
        {value}
      </p>
      <p className="mt-1 text-[11px] uppercase tracking-wide text-text-muted">{label}</p>
    </div>
  );
}

function ProductPanel({ product, verdict }: { product: SessionAggregate["products"][number]; verdict?: ProductVerdict }) {
  const sampleCodes = product.samples.map((s) => s.sampleCode);
  const sectionMeta = product.samples[0]?.sections ?? [];

  const [openSections, setOpenSections] = useState<Set<string>>(
    () => new Set(sectionMeta[0] ? [sectionMeta[0].sectionId] : [])
  );

  function toggleSection(sectionId: string) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  }

  const sectionChartData = sectionMeta.map((section) => {
    const row: Record<string, string | number> = { section: section.letter };
    for (const sample of product.samples) {
      const match = sample.sections.find((s) => s.sectionId === section.sectionId);
      row[sample.sampleCode] = match?.targetPct ?? 0;
    }
    return row;
  });

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface-raised shadow-sm">
      <div className="border-b border-border px-6 py-5">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-brand-primary-strong">
          {product.productName}
        </h2>
      </div>

      <div className="grid gap-8 border-b border-border px-6 py-6 lg:grid-cols-2">
        <div>
          <SectionLabel>Parameter comparison (% rating Target)</SectionLabel>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={sectionChartData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="section" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip
                contentStyle={{ background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }}
                formatter={(value) => `${Number(value).toFixed(0)}%`}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {sampleCodes.map((code, i) => (
                <Bar key={code} dataKey={code} fill={SAMPLE_COLORS[i % SAMPLE_COLORS.length]} radius={[3, 3, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <SectionLabel>Sensory profile (% rating Target)</SectionLabel>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={sectionChartData}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="section" tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "var(--text-muted)" }} axisLine={false} />
              {sampleCodes.map((code, i) => (
                <Radar
                  key={code}
                  dataKey={code}
                  stroke={SAMPLE_COLORS[i % SAMPLE_COLORS.length]}
                  fill={SAMPLE_COLORS[i % SAMPLE_COLORS.length]}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              ))}
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }}
                formatter={(value) => `${Number(value).toFixed(0)}%`}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {verdict && (verdict.sectionVerdicts.length > 0 || verdict.concerns.length > 0) && (
        <div className="border-b border-border bg-brand-primary-soft/30 px-6 py-5">
          <SectionLabel>Conclusion &amp; verdict</SectionLabel>
          <p className="text-sm leading-relaxed text-text">{verdict.overallSummary}</p>
          {verdict.sectionVerdicts.length > 0 && (
            <ul className="mt-3 flex flex-col gap-1 text-sm text-text-muted">
              {verdict.sectionVerdicts.map((sv) => (
                <li key={sv.sectionId}>• {sv.text}</li>
              ))}
            </ul>
          )}
          {verdict.concerns.length > 0 && (
            <div className="mt-4 rounded-[var(--radius-sm)] border border-status-warning/40 bg-status-warning/10 px-4 py-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-status-warning">Areas of concern</p>
              <ul className="flex flex-col gap-1 text-sm text-text">
                {verdict.concerns.map((c, idx) => (
                  <li key={idx}>• {c}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {verdict && verdict.sectionVerdicts.length === 0 && verdict.concerns.length === 0 && (
        <div className="border-b border-border px-6 py-5 text-sm text-text-muted">{verdict.overallSummary}</div>
      )}

      <div className="flex flex-col divide-y divide-border">
        {sectionMeta.map((section) => (
          <SectionAccordion
            key={section.sectionId}
            section={section}
            product={product}
            open={openSections.has(section.sectionId)}
            onToggle={() => toggleSection(section.sectionId)}
          />
        ))}
      </div>
    </div>
  );
}

function SectionAccordion({
  section,
  product,
  open,
  onToggle,
}: {
  section: SectionTargetScore;
  product: SessionAggregate["products"][number];
  open: boolean;
  onToggle: () => void;
}) {
  const rankedSamples = product.samples
    .map((s) => ({ sample: s, section: s.sections.find((sec) => sec.sectionId === section.sectionId) }))
    .filter((e): e is { sample: (typeof product.samples)[number]; section: SectionTargetScore } => e.section !== undefined)
    .sort((a, b) => (a.section.rank ?? 99) - (b.section.rank ?? 99));

  const leader = rankedSamples.find((e) => e.section.rank === 1);
  const attributeNames = section.attributes.map((a) => ({ id: a.attributeId, name: a.name }));

  return (
    <div>
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition-colors hover:bg-surface-sunken/40"
      >
        <div className="flex items-center gap-3">
          <span className={`transition-transform ${open ? "rotate-90" : ""} text-text-muted`}>›</span>
          <span className="font-[family-name:var(--font-display)] font-semibold text-text">
            {section.letter}. {section.name}
          </span>
        </div>
        {leader && (
          <span className="flex items-center gap-1.5 text-xs text-text-muted">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-accent text-[10px] font-bold text-brand-primary-strong">
              1
            </span>
            {leader.sample.sampleName} ({leader.section.targetPct?.toFixed(0)}%)
          </span>
        )}
      </button>

      {open && (
        <div className="px-6 pb-6">
          <div className="overflow-x-auto rounded-[var(--radius-sm)] border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-sunken/60 text-left text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                  <th className="py-2.5 pl-4 pr-3">Rank</th>
                  <th className="py-2.5 pr-3">Sample</th>
                  <th className="py-2.5 pr-3">Target %</th>
                  <th className="py-2.5 pr-3">Near-target %</th>
                  <th className="py-2.5 pr-4">Submissions</th>
                </tr>
              </thead>
              <tbody>
                {rankedSamples.map(({ sample, section: sec }) => (
                  <tr key={sample.sampleId} className={`border-t border-border ${sec.rank === 1 ? "bg-brand-accent-soft/25" : ""}`}>
                    <td className="py-2.5 pl-4 pr-3">
                      {sec.rank ? (
                        <span
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                            sec.rank === 1 ? "bg-brand-accent text-brand-primary-strong" : "bg-surface-sunken text-text-muted"
                          }`}
                        >
                          {sec.rank}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-2.5 pr-3 font-medium text-text">{sample.sampleName}</td>
                    <td className="py-2.5 pr-3 font-semibold text-text">{fmtPct(sec.targetPct)}</td>
                    <td className="py-2.5 pr-3 text-text-muted">{fmtPct(sec.nearTargetPct)}</td>
                    <td className="py-2.5 pr-4 text-text-muted">{sample.submissionCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {attributeNames.length > 0 && (
            <div className="mt-4 overflow-x-auto rounded-[var(--radius-sm)] border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-sunken/60 text-left text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                    <th className="py-2.5 pl-4 pr-3">Sub-parameter</th>
                    {product.samples.map((s) => (
                      <th key={s.sampleId} className="py-2.5 pr-3">
                        {s.sampleCode}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {attributeNames.map((attr) => (
                    <tr key={attr.id} className="border-t border-border">
                      <td className="py-2 pl-4 pr-3 text-text">{attr.name}</td>
                      {product.samples.map((s) => {
                        const sec = s.sections.find((x) => x.sectionId === section.sectionId);
                        const a = sec?.attributes.find((x) => x.attributeId === attr.id);
                        return (
                          <td key={s.sampleId} className="py-2 pr-3 text-text-muted">
                            {fmtPct(a?.targetPct ?? null)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-text-muted">{children}</p>;
}

function fmtPct(value: number | null | undefined) {
  return value === null || value === undefined ? "—" : `${value.toFixed(0)}%`;
}
