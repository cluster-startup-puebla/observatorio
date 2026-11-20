import Link from "next/link";
import type { CompanyAction } from "@/lib/app/company-actions";

export function CompanyChecklist({ actions }: { actions: CompanyAction[] }) {
  if (!actions.length) return null;
  return (
    <section className="grid gap-3">
      <h2 className="text-h3 text-ink">Pendientes</h2>
      <ul className="grid gap-2">
        {actions.map((action) => (
          <li key={action.label}>
            <Link
              href={action.href}
              className="block rounded-2xl border border-line bg-elevated px-4 py-3 text-body font-semibold text-ink"
            >
              {action.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
