import { BandejaList } from "@/app/admin/bandeja/bandeja-list";
import { listBandeja } from "@/lib/admin/bandeja/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function BandejaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; kind?: string; error?: string }>;
}) {
  await requireSuperadmin();
  const params = await searchParams;
  const data = await listBandeja(params.page, params.kind);
  return <BandejaList rows={data.rows} page={data.page} error={params.error} />;
}
