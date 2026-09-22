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
import type { SessionAggregate } from "@/lib/scoring/aggregate";
import { closeSession } from "@/lib/actions/sessions";

const SAMPLE_COLORS = ["#7A1F2B", "#C8983A", "#2F7A4F", "#3B6E91", "#8B5FA6", "#B1502F"];

type AggregateResponse = { aggregate: SessionAggregate; narratives: Record<string, string> };

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
  const narratives = data?.narratives ?? initialData.narratives;

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
          narrative={narratives[product.sessionProductId]}
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

function ProductPanel({ product, narrative }: { product: SessionAggregate["products"][number]; narrative?: string }) {
  const sampleCodes = product.samples.map((s) => s.sampleCode);

  const barData = product.samples[0]?.sections.flatMap((section) =>
    section.attributes.map((attr) => {
      const row: Record<string, string | number> = { attribute: attr.name };
      for (const sample of product.samples) {
        const match = sample.sections.find((s) => s.sectionId === section.sectionId)?.attributes.find((a) => a.attributeId === attr.attributeId);
        row[sample.sampleCode] = match?.average ?? 0;
      }
      return row;
    })
  ) ?? [];

  const radarData = product.samples[0]?.sections.map((section) => {
    const row: Record<string, string | number> = { section: `${section.letter}` };
    for (const sample of product.samples) {
      const match = sample.sections.find((s) => s.sectionId === section.sectionId);
      row[sample.sampleCode] = match?.average ?? 0;
    }
    return row;
  }) ?? [];

  const ranked = [...product.samples].sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface-raised shadow-sm">
      <div className="border-b border-border px-6 py-5">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-brand-primary-strong">
          {product.productName}
        </h2>
        {narrative && <p className="mt-1.5 text-sm leading-relaxed text-text-muted">{narrative}</p>}
      </div>

      <div className="grid gap-8 px-6 py-6 lg:grid-cols-2">
        <div>
          <SectionLabel>Per-attribute comparison</SectionLabel>
          <div className="h-72 w-full overflow-x-auto">
            <ResponsiveContainer width={Math.max(500, barData.length * 42)} height={280}>
              <BarChart data={barData} margin={{ top: 4, right: 8, bottom: 60, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="attribute" tick={{ fontSize: 10, fill: "var(--text-muted)" }} angle={-40} textAnchor="end" interval={0} height={70} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface-raised)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {sampleCodes.map((code, i) => (
                  <Bar key={code} dataKey={code} fill={SAMPLE_COLORS[i % SAMPLE_COLORS.length]} radius={[3, 3, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <SectionLabel>Sensory profile (section averages)</SectionLabel>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="section" tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
              <PolarRadiusAxis domain={[0, 5]} tick={{ fontSize: 10, fill: "var(--text-muted)" }} axisLine={false} />
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
                contentStyle={{
                  background: "var(--surface-raised)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  fontSize: 12,
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="overflow-x-auto border-t border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-sunken/60 text-left text-[11px] font-semibold uppercase tracking-wide text-text-muted">
              <th className="py-3 pl-6 pr-4">Rank</th>
              <th className="py-3 pr-4">Sample</th>
              <th className="py-3 pr-4">Avg. Attribute</th>
              <th className="py-3 pr-4">Overall Liking</th>
              <th className="py-3 pr-4">Composite</th>
              <th className="py-3 pr-4">Deviation</th>
              <th className="py-3 pr-6">Submissions</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((sample) => (
              <tr
                key={sample.sampleId}
                className={`border-t border-border last:border-b-0 ${sample.rank === 1 ? "bg-brand-accent-soft/25" : ""}`}
              >
                <td className="py-3 pl-6 pr-4">
                  {sample.rank ? (
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        sample.rank === 1
                          ? "bg-brand-accent text-brand-primary-strong"
                          : "bg-surface-sunken text-text-muted"
                      }`}
                    >
                      {sample.rank}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="py-3 pr-4 font-medium text-text">{sample.sampleName}</td>
                <td className="py-3 pr-4 text-text-muted">{fmt(sample.averageAttributeScore)}</td>
                <td className="py-3 pr-4 text-text-muted">{fmt(sample.overallLiking)}</td>
                <td className="py-3 pr-4 font-semibold text-text">{fmt(sample.composite)}</td>
                <td className="py-3 pr-4 text-text-muted">{fmt(sample.deviation)}</td>
                <td className="py-3 pr-6 text-text-muted">{sample.submissionCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-text-muted">{children}</p>;
}

function fmt(value: number | null) {
  return value === null ? "—" : value.toFixed(2);
}
