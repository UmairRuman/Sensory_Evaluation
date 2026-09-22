"use client";

import { useActionState } from "react";
import { joinSession } from "@/lib/actions/panelist";

export function JoinForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(joinSession.bind(null, token), undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium text-text-muted">
          Your name
        </label>
        <input
          id="name"
          name="name"
          required
          className="rounded-[var(--radius-sm)] border border-border bg-surface px-3.5 py-2.5 text-base outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-accent/40"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="age" className="text-sm font-medium text-text-muted">
            Age (optional)
          </label>
          <input
            id="age"
            name="age"
            type="number"
            min={1}
            max={120}
            className="rounded-[var(--radius-sm)] border border-border bg-surface px-3.5 py-2.5 text-base outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-accent/40"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="department" className="text-sm font-medium text-text-muted">
            Department (optional)
          </label>
          <input
            id="department"
            name="department"
            className="rounded-[var(--radius-sm)] border border-border bg-surface px-3.5 py-2.5 text-base outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-accent/40"
          />
        </div>
      </div>
      {state?.error && <p className="text-sm text-status-danger">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-full bg-brand-primary px-4 py-3 text-base font-semibold text-text-on-brand shadow-sm transition-colors hover:bg-brand-primary-strong disabled:opacity-60"
      >
        {pending ? "Starting…" : "Start scoring"}
      </button>
    </form>
  );
}
