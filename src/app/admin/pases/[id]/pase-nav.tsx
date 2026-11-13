import { PersonTabs } from "@/components/admin/person-tabs";

export const paseTabs = [
  { value: "qr", label: "QR" },
  { value: "llegada", label: "Llegada" },
];

export function PaseNav({ id, active }: { id: string; active: string }) {
  return (
    <PersonTabs
      active={active}
      tabs={paseTabs.map((tab) => ({ ...tab, href: `/admin/pases/${id}?tab=${tab.value}` }))}
    />
  );
}
