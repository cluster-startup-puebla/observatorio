import Link from "next/link";
import { listCrumbs, PanelHeader } from "@/components/admin/panel-header";
import { Kicker } from "@/components/landing/atoms/kicker";
import { Field, controlClass } from "@/components/landing/molecules/field";
import { MesaQrScanner } from "@/components/mesa/qr-scanner";
import { mesaHref } from "@/lib/admin/mesa/href";
import { requireMesa } from "@/lib/auth/guards";
import { scanDeskAction } from "@/lib/flow-actions";

export const instant = false;

export default async function MesaPage({
  searchParams,
}: {
  searchParams: Promise<{ codigo?: string; nombre?: string; estatus?: string; error?: string }>;
}) {
  await requireMesa();
  const params = await searchParams;
  const arrived = params.estatus === "llego" && params.nombre;

  return (
    <section className="container-site py-10 lg:py-14">
      <div className="grid max-w-xl gap-6">
        <Kicker>Mesa de registro</Kicker>
        <PanelHeader
          title="Registrar llegada"
          lead="El pase solo existe si el perfil ya está terminado. Quien no está registrado no entra."
          crumbs={listCrumbs("Mesa", mesaHref)}
        />
        <Link href="/admin">Volver al panel</Link>
        <p data-testid="mesa-href">{mesaHref}</p>
        <form action={scanDeskAction} className="grid gap-5">
          <MesaQrScanner hold={params.codigo ?? ""} />
          <Field id="codigo" label="Código QR">
            <input
              id="codigo"
              name="codigo"
              className={controlClass}
              autoComplete="off"
              defaultValue={params.codigo ?? ""}
            />
          </Field>
          <button type="submit" className="btn btn-primary">
            Registrar llegada
          </button>
        </form>
        {arrived ? (
          <div className="grid gap-2 border border-line bg-surface-subtle p-5">
            <p data-testid="bienvenida" className="text-h3 text-ink">
              Bienvenida, {params.nombre}
            </p>
            <p data-testid="estatus" className="text-body text-ink">
              Llegó
            </p>
          </div>
        ) : null}
        {params.error ? <p className="text-small text-mark">{params.error}</p> : null}
      </div>
    </section>
  );
}
