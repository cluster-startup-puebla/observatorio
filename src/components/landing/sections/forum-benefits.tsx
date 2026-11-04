import { forumBenefits } from "@/content/forum-public";

export function ForumBenefits() {
  return (
    <div className="mt-12">
      <p className="text-micro uppercase text-ink-muted">Beneficios para las empresas participantes</p>
      <ol className="mt-4 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
        {forumBenefits.map((benefit, index) => (
          <li key={benefit} className="bg-surface-subtle p-6">
            <p className="text-h3 text-brand">{String(index + 1).padStart(2, "0")}</p>
            <p className="text-body mt-2 text-ink">{benefit}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
