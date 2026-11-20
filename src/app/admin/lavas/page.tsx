import { LavasAdmin } from "@/app/admin/lavas/lavas-admin";
import { listLavaActions } from "@/lib/admin/lavas/list-actions";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function LavasPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; edit?: string }>;
}) {
  await requireSuperadmin();
  const params = await searchParams;
  const rows = await listLavaActions();
  return <LavasAdmin rows={rows} edit={params.edit} error={params.error} />;
}
