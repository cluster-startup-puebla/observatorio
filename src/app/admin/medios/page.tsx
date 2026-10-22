import { MediosList } from "@/app/admin/medios/medios-list";
import { listMedios } from "@/lib/admin/medios/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function MediosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; error?: string }>;
}) {
  await requireSuperadmin();
  const params = await searchParams;
  const data = await listMedios(params.page);
  return <MediosList rows={data.rows} page={data.page} error={params.error} />;
}
