export function BrandMark({ size = "md" }: { size?: "sm" | "md" }) {
  const dims = size === "sm" ? "h-8 w-8 text-sm" : "h-10 w-10 text-base";
  return (
    <span
      className={`flex ${dims} shrink-0 items-center justify-center rounded-[10px] font-[family-name:var(--font-display)] font-bold text-brand-primary shadow-sm`}
      style={{
        background: "linear-gradient(155deg, var(--brand-accent-soft), var(--surface-raised) 60%)",
        border: "1px solid var(--brand-accent)",
      }}
    >
      D
    </span>
  );
}
