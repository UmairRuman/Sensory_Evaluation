"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions/auth";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-text-muted">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-[var(--radius-sm)] border border-border bg-surface px-3.5 py-2.5 text-text outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-accent/40"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-text-muted">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="rounded-[var(--radius-sm)] border border-border bg-surface px-3.5 py-2.5 text-text outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-accent/40"
        />
      </div>
      {state?.error && <p className="text-sm text-status-danger">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-full bg-brand-primary px-4 py-2.5 font-semibold text-text-on-brand shadow-sm transition-colors hover:bg-brand-primary-strong disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
