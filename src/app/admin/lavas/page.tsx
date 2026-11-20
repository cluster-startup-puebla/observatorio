import { BackfillButton } from "@/app/admin/lavas/backfill-button";
import { BoostForm } from "@/app/admin/lavas/boost-form";
import { LavasAdmin } from "@/app/admin/lavas/lavas-admin";
import { ManualForm } from "@/app/admin/lavas/manual-form";
import { LavasOkToast } from "@/app/admin/lavas/ok-toast";
import { listLavaActions } from "@/lib/admin/lavas/list-actions";
import { listLavaCompanies, loadLavaBoost } from "@/lib/admin/lavas/load-boost";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function LavasPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    edit?: string;
    ok?: string;
    panel?: string;
    summary?: string;
  }>;
}) {
  await requireSuperadmin();
  const params = await searchParams;
  const [rows, boost, companies] = await Promise.all([
    listLavaActions(),
    loadLavaBoost(),
    listLavaCompanies(),
  ]);
  return (
    <>
      <LavasOkToast ok={params.ok} summary={params.summary} />
      <LavasAdmin rows={rows} edit={params.edit} error={params.error}>
        <BoostForm
          multiplier={boost.multiplier}
          flatBonus={boost.flatBonus}
          error={params.panel === "boost" ? params.error : undefined}
        />
        <ManualForm
          companies={companies}
          error={params.panel === "manual" ? params.error : undefined}
        />
        <BackfillButton />
      </LavasAdmin>
    </>
  );
}
