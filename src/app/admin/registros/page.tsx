import { RegistrosList } from "@/app/admin/registros/registros-list";
import { listRegistros } from "@/lib/admin/registros/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function RegistrosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireSuperadmin();
  const params = await searchParams;
  const data = await listRegistros(params.page);
  return <RegistrosList rows={data.rows} page={data.page} total={data.total} />;
}
