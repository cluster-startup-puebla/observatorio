import { notFound } from "next/navigation";
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
      <a href={mesaHref}>Volver a la mesa</a>
      <h1 className="text-h1 text-ink">Llegada</h1>
      <p data-testid="bienvenida">Bienvenida, {query.nombre || profileId}</p>
      <p data-testid="estatus">Llegó</p>
    </section>
  );
}
