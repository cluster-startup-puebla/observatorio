import { redirectTo } from "@/lib/admin/redirect";
import { runLavaBackfill } from "@/lib/admin/lavas/run-backfill";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  await requireSuperadmin();
  const result = await runLavaBackfill();
  if (!result.ok) {
    return redirectTo(request, `/admin/lavas?error=${encodeURIComponent(result.reason)}`);
  }
  const summary = `perfil ${result.counts.perfil}, eval ${result.counts.evaluacion}, llegada ${result.counts.llegada}, consent ${result.counts.consent}, reto ${result.counts.reto}`;
  return redirectTo(
    request,
    `/admin/lavas?ok=backfill&summary=${encodeURIComponent(summary)}`,
  );
}
