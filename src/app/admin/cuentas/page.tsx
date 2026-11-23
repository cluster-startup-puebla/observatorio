import { CuentasList } from "@/app/admin/cuentas/cuentas-list";
import { listCuentas } from "@/lib/admin/cuentas/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function CuentasPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; error?: string; q?: string }>;
}) {
  await requireSuperadmin();
  const params = await searchParams;
  const data = await listCuentas(params.page, params.q);
  return (
    <CuentasList
      rows={data.rows}
      page={data.page}
      total={data.total}
      orgs={data.orgs}
      q={data.q}
      error={params.error}
    />
  );
}
