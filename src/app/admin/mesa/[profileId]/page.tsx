import { notFound } from "next/navigation";
import { PanelHeader, trailCrumbs } from "@/components/admin/panel-header";
import { mesaHref } from "@/lib/admin/mesa/href";

export const instant = false;

export default async function MesaDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ profileId: string }>;
  searchParams: Promise<{ nombre?: string }>;
}) {
  const { profileId } = await params;
  const query = await searchParams;
  if (!profileId) notFound();
  return (
    <section className="container-site py-10">
      <PanelHeader title="Llegada" crumbs={trailCrumbs("Mesa", mesaHref, "Llegada")} />
      <p data-testid="bienvenida">Bienvenida, {query.nombre || profileId}</p>
      <p data-testid="estatus">Llegó</p>
    </section>
  );
}
