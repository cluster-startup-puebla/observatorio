import Link from "next/link";

const tabs = [
  { value: "ficha", label: "Ficha" },
  { value: "hechos", label: "Seguimiento" },
];

export function ContactoTabs({ id, active, events }: { id: string; active: string; events: number }) {
  return (
    <nav className="mt-8 flex flex-wrap gap-6 border-b border-line">
      {tabs.map((tab) => {
        const on = tab.value === active;
        const count = tab.value === "hechos" ? events : 0;
        return (
          <Link
            key={tab.value}
            href={`/admin/crm/${id}?tab=${tab.value}`}
            data-testid={`tab-${tab.value}`}
            className={
              on
                ? "-mb-px border-b-2 border-brand pb-3 text-small font-semibold text-brand"
                : "-mb-px border-b-2 border-transparent pb-3 text-small font-semibold text-ink-secondary"
            }
          >
            {tab.label}
            {count ? <span className="ml-2">{count}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}
