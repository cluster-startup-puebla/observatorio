import { PersonTabs } from "@/components/admin/person-tabs";

export function CuentaNav({
  id,
  active,
  tabs,
  answers,
  mail,
}: {
  id: string;
  active: string;
  tabs: { value: string; label: string }[];
  answers: number;
  mail: number;
}) {
  const counts: Record<string, number> = { respuestas: answers, correos: mail };
  return (
    <PersonTabs
      active={active}
      tabs={tabs.map((tab) => ({
        ...tab,
        href: `/admin/cuentas/${id}?tab=${tab.value}`,
        count: counts[tab.value] ?? 0,
      }))}
    />
  );
}
