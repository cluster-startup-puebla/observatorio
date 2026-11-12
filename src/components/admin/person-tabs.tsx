import Link from "next/link";

export function PersonTabs({
  active,
  tabs,
}: {
  active: string;
  tabs: { value: string; label: string; href: string; count?: number }[];
}) {
  return (
    <nav className="mt-8 flex flex-wrap gap-6 border-b border-line">
      {tabs.map((tab) => {
        const on = tab.value === active;
        return (
          <Link
            key={tab.value}
            href={tab.href}
            data-testid={`tab-${tab.value}`}
            className={
              on
                ? "-mb-px border-b-2 border-brand pb-3 text-small font-semibold text-brand"
                : "-mb-px border-b-2 border-transparent pb-3 text-small font-semibold text-ink-secondary"
            }
          >
            {tab.label}
            {tab.count ? <span className="ml-2">{tab.count}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}
