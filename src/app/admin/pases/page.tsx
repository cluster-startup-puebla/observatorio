import { RepairPasses } from "@/app/admin/pases/repair-passes";
import { PasesList } from "@/app/admin/pases/pases-list";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { listPases } from "@/lib/admin/pases/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function PasesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; error?: string; ok?: string; q?: string; sector?: string }>;
}) {
  await requireSuperadmin();
  const params = await searchParams;
  const data = await listPases(params.page, params.q, params.sector);
  const notice = params.error ? (
    <Alert variant="destructive">
      <AlertDescription>{params.error}</AlertDescription>
    </Alert>
  ) : params.ok ? (
    <Alert>
      <AlertDescription>Se generaron {params.ok} pases.</AlertDescription>
    </Alert>
  ) : null;
  return (
    <PasesList
      rows={data.rows}
      page={data.page}
      total={data.total}
      q={data.q}
      sector={data.sector}
      sectors={data.sectors}
      notice={notice}
    >
      <RepairPasses />
    </PasesList>
  );
}
