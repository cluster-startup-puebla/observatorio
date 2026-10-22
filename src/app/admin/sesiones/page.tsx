import { SesionesList } from "@/app/admin/sesiones/sesiones-list";
import { sessionSectorChoices } from "@/lib/admin/sesiones/choices";
import { listSesiones } from "@/lib/admin/sesiones/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function SesionesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; error?: string }>;
}) {
  await requireSuperadmin();
  const params = await searchParams;
  const [data, sectors] = await Promise.all([listSesiones(params.page), sessionSectorChoices()]);
  return (
    <SesionesList
      rows={data.rows}
      page={data.page}
      error={params.error}
      sectors={sectors}
      quotasBySession={data.quotasBySession}
    />
  );
}
