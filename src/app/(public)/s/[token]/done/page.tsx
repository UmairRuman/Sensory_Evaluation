export default function DonePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface px-6 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-status-target/15 text-3xl">
        ✓
      </span>
      <h1 className="mt-5 font-[family-name:var(--font-display)] text-xl font-semibold text-brand-primary-strong">
        Thank you!
      </h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-text-muted">
        Your scores have been submitted for every sample in this session. You may close this page.
      </p>
    </main>
  );
}
