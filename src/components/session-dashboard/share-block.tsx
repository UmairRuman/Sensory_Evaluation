"use client";

import { useState } from "react";
import Image from "next/image";

export function ShareBlock({ joinUrl, qrDataUrl, joinCode }: { joinUrl: string; qrDataUrl: string; joinCode: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable — user can select the text manually
    }
  }

  return (
    <div className="flex flex-col gap-5 rounded-[var(--radius-lg)] border border-border bg-surface-raised p-6 shadow-sm sm:flex-row sm:items-center">
      <div className="flex shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-white p-3 shadow-xs">
        <Image src={qrDataUrl} alt="Panelist QR code" width={128} height={128} unoptimized className="block" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Panelist scoring link</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded-[var(--radius-sm)] bg-surface-sunken px-3 py-2 text-sm text-text">
            {joinUrl}
          </code>
          <button
            onClick={copy}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-brand-primary-soft px-3.5 py-2 text-xs font-semibold text-brand-primary-strong transition-colors hover:bg-brand-accent-soft"
          >
            {copied ? "✓ Copied" : "Copy link"}
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">Manual join code</span>
          <span className="rounded-[var(--radius-sm)] border border-brand-accent/40 bg-brand-accent-soft px-3 py-1 font-[family-name:var(--font-display)] text-lg font-semibold tracking-[0.2em] text-brand-primary-strong">
            {joinCode}
          </span>
        </div>
      </div>
    </div>
  );
}
