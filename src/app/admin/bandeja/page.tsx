import { DataList } from "@/components/admin/data-list";
import { listBandeja } from "@/lib/admin/bandeja/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

const filters = [
  { href: "/admin/bandeja", label: "Todos" },
  { href: "/admin/bandeja?kind=password", label: "Contraseña" },
  { href: "/admin/bandeja?kind=event_pass", label: "Pase" },
  { href: "/admin/bandeja?kind=open_innovation", label: "Innovación abierta" },
];

export default async function BandejaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; kind?: string }>;
}) {
  await requireSuperadmin();
  const params = await searchParams;
  const data = await listBandeja(params.page, params.kind);
  return (
    <DataList
      title="Bandeja"
      lead="Los tres correos: contraseña, pase e innovación abierta."
      columns={[
        { key: "kind", label: "Tipo" },
        { key: "to_email", label: "Para" },
        { key: "subject", label: "Asunto" },
      ]}
      rows={data.rows}
      page={data.page}
      basePath="/admin/bandeja"
    >
      <nav className="mt-6 flex gap-3">
        {filters.map((filter) => (
          <a key={filter.href} className="text-link" href={filter.href}>
            {filter.label}
          </a>
        ))}
      </nav>
    </DataList>
  );
}
