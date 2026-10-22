import { InvitacionesList } from "@/app/admin/invitaciones/invitaciones-list";
import { listInvitaciones } from "@/lib/admin/invitaciones/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function InvitacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; error?: string }>;
}) {
  await requireSuperadmin();
  const params = await searchParams;
  const data = await listInvitaciones(params.page);
  return <InvitacionesList rows={data.rows} page={data.page} error={params.error} orgs={data.orgs} />;
}
