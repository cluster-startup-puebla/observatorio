import { RetosList } from "@/app/admin/retos/retos-list";
import { listRetos } from "@/lib/admin/retos/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function AdminRetosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireSuperadmin();
  const params = await searchParams;
  const data = await listRetos(params.page);
  return <RetosList rows={data.rows} page={data.page} total={data.total} />;
}
