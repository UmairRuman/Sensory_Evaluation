import { BrandMark } from "@/components/host/brand-mark";

export function ClosedNotice({ title, message }: { title: string; message: string }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface px-6 text-center">
      <BrandMark />
      <h1 className="mt-5 font-[family-name:var(--font-display)] text-xl font-semibold text-brand-primary-strong">
        {title}
      </h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-text-muted">{message}</p>
    </main>
  );
}
