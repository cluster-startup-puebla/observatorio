import { PanelHeader, parentLabel, trailCrumbs } from "@/components/admin/panel-header";

export function DetailFrame({
  title,
  backHref,
  facts,
  tabs,
  active,
  children,
}: {
  title: string;
  backHref: string;
  facts: { label: string; value: string }[];
  tabs: { value: string; label: string }[];
  active: string;
  children: React.ReactNode;
}) {
  return (
    <main className="px-8 py-8">
      <PanelHeader title={title} crumbs={trailCrumbs(parentLabel(backHref), backHref, title)} />
      <dl className="grid gap-3 sm:grid-cols-2">
        {facts.map((fact) => (
          <div key={fact.label} className="rounded-xl border border-line bg-elevated px-4 py-3">
            <dt className="text-small text-ink-secondary">{fact.label}</dt>
            <dd className="text-body text-ink">{fact.value || "—"}</dd>
          </div>
        ))}
      </dl>
      <nav className="mt-8 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <a
            key={tab.value}
            href={`?tab=${tab.value}`}
            data-testid={`tab-${tab.value}`}
            className={tab.value === active ? "btn btn-primary" : "btn"}
          >
            {tab.label}
          </a>
        ))}
      </nav>
      <div className="mt-6">{children}</div>
    </main>
  );
}
