import { PasesList } from "@/app/admin/pases/pases-list";
import { listPases } from "@/lib/admin/pases/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function PasesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireSuperadmin();
  const params = await searchParams;
  const data = await listPases(params.page);
  return <PasesList rows={data.rows} page={data.page} />;
}
