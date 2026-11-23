import { EmpresasList } from "@/app/admin/empresas/empresas-list";
import { empresaChoices } from "@/lib/admin/empresas/choices";
import { listEmpresas } from "@/lib/admin/empresas/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function EmpresasPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; error?: string; q?: string }>;
}) {
  await requireSuperadmin();
  const params = await searchParams;
  const [data, choices] = await Promise.all([
    listEmpresas(params.page, params.q),
    empresaChoices(),
  ]);
  return (
    <EmpresasList
      rows={data.rows}
      page={data.page}
      total={data.total}
      q={data.q}
      error={params.error}
      sectors={choices.sectors}
      profiles={choices.profiles}
    />
  );
}
