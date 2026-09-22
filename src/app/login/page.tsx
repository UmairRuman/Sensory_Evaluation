import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";
import { BrandMark } from "@/components/host/brand-mark";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="hero-surface relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-brand-accent/10 blur-3xl" />

      <div className="relative w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <BrandMark size="md" />
          <p className="mt-4 font-[family-name:var(--font-display)] text-xs font-medium uppercase tracking-[0.2em] text-brand-accent-soft">
            Dawn Foods Corp. Ltd.
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold text-text-on-brand">
            Sensory Evaluation
          </h1>
        </div>

        <div className="rounded-[var(--radius-lg)] border border-white/10 bg-surface-raised p-8 shadow-lg">
          <p className="mb-6 text-sm text-text-muted">Sign in to Commercial Quality Assurance</p>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
