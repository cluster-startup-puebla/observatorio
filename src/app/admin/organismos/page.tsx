import { OrganismosList } from "@/app/admin/organismos/organismos-list";
import { listOrganismos } from "@/lib/admin/organismos/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function OrganismosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; error?: string; name?: string; color?: string; edit?: string }>;
}) {
  await requireSuperadmin();
  const params = await searchParams;
  const data = await listOrganismos(params.page);
  return <OrganismosList rows={data.rows} page={data.page} params={params} />;
}
