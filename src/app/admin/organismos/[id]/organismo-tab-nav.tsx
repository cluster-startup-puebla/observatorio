import Link from "next/link";

export const organismoTabs = [
  { value: "miembros", label: "Miembros" },
  { value: "crm", label: "CRM" },
  { value: "enlace", label: "Enlaces" },
  { value: "actividad", label: "Actividad" },
  { value: "logo", label: "Logo" },
];

export function OrganismoTabNav({ id, active, contactCount }: { id: string; active: string; contactCount: number }) {
  return (
    <nav className="mt-8 flex flex-wrap gap-6 border-b border-line">
      {organismoTabs.map((tab) => {
        const on = tab.value === active;
        const count = tab.value === "crm" ? contactCount : 0;
        return (
          <Link
            key={tab.value}
            href={`/admin/organismos/${id}?tab=${tab.value}`}
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
