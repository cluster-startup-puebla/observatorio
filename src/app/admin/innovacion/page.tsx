import { InnovacionList } from "@/app/admin/innovacion/innovacion-list";
import { listAcceptedInnovation } from "@/lib/admin/innovacion/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function InnovacionPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireSuperadmin();
  const params = await searchParams;
  const data = await listAcceptedInnovation(params.page);
  return <InnovacionList rows={data.rows} page={data.page} />;
}
