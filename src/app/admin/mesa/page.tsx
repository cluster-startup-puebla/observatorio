import { listCrumbs, PanelHeader } from "@/components/admin/panel-header";
import { Kicker } from "@/components/landing/atoms/kicker";
import { MesaDesk } from "@/components/mesa/mesa-desk";
import { mesaHref } from "@/lib/admin/mesa/href";
import { requireMesa } from "@/lib/auth/guards";
import { usesSupabaseAuth } from "@/lib/supabase/auth-session";

export const instant = false;

export default async function MesaPage({
  searchParams,
}: {
  searchParams: Promise<{ codigo?: string; nombre?: string; estatus?: string; error?: string }>;
}) {
  await requireMesa();
  const params = await searchParams;
  const name = params.estatus === "llego" ? params.nombre : undefined;

  return (
    <main className="flex h-full min-h-0 flex-col px-8 py-6">
      <Kicker>Mesa de registro</Kicker>
      <PanelHeader
        title="Registrar llegada"
        lead="Apunta el pase a la cámara. Si el perfil está terminado, la llegada queda registrada."
        crumbs={listCrumbs("Mesa", mesaHref)}
      />
      <MesaDesk
        hold={params.codigo ?? ""}
        name={name}
        error={params.error}
        action={usesSupabaseAuth() ? "/api/admin/mesa" : undefined}
      />
    </main>
  );
}
