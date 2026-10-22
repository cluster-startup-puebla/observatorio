import { SectoresList } from "@/app/admin/sectores/sectores-list";
import { listSectores } from "@/lib/admin/sectores/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function SectoresPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; error?: string }>;
}) {
  await requireSuperadmin();
  const params = await searchParams;
  const data = await listSectores(params.page);
  return <SectoresList rows={data.rows} page={data.page} error={params.error} />;
}
