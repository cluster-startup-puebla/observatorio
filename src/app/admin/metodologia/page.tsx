import { MetodologiaList } from "@/app/admin/metodologia/metodologia-list";
import { listMetodologia } from "@/lib/admin/metodologia/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function MetodologiaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; error?: string }>;
}) {
  await requireSuperadmin();
  const params = await searchParams;
  const data = await listMetodologia(params.page);
  return <MetodologiaList rows={data.rows} page={data.page} error={params.error} />;
}
