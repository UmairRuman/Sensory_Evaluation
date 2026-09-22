import { listCategories } from "@/lib/masterfile/queries";
import { SessionWizard } from "@/components/session-wizard/session-wizard";

export default async function NewSessionPage() {
  const categories = await listCategories();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <p className="font-[family-name:var(--font-display)] text-xs font-medium uppercase tracking-[0.16em] text-brand-accent">
        New Session
      </p>
      <h1 className="mt-1 mb-8 font-[family-name:var(--font-display)] text-2xl font-semibold text-brand-primary-strong">
        Set up a sensory evaluation session
      </h1>
      <SessionWizard categories={categories} />
    </div>
  );
}
