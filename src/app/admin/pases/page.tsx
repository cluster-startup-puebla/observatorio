import { RepairPasses } from "@/app/admin/pases/repair-passes";
import { PasesList } from "@/app/admin/pases/pases-list";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { listPases } from "@/lib/admin/pases/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function PasesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; error?: string; ok?: string }>;
}) {
  await requireSuperadmin();
  const params = await searchParams;
  const data = await listPases(params.page);
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
    <PasesList rows={data.rows} page={data.page} total={data.total} notice={notice}>
      <RepairPasses />
    </PasesList>
  );
}
