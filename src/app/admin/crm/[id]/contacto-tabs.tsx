import { PersonTabs } from "@/components/admin/person-tabs";

const tabs = [
  { value: "ficha", label: "Ficha" },
  { value: "hechos", label: "Seguimiento" },
];

export function ContactoTabs({ id, active, events }: { id: string; active: string; events: number }) {
  return (
    <PersonTabs
      active={active}
      tabs={tabs.map((tab) => ({
        ...tab,
        href: `/admin/crm/${id}?tab=${tab.value}`,
        count: tab.value === "hechos" ? events : 0,
      }))}
    />
  );
}
