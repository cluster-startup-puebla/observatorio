import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RetoDetail } from "@/components/retos/reto-detail";
import { pageMetadata } from "@/lib/metadata";
import { getPortalChallenge } from "@/lib/retos/load-portal";

export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const row = await getPortalChallenge(id);
  if (!row) {
    return pageMetadata({
      title: "Reto",
      description: "Reto del Observatorio Tecnológico de Puebla.",
      path: `/retos/${id}`,
    });
  }
  return pageMetadata({
    title: row.name,
    description: row.successMetric.slice(0, 140),
    path: `/retos/${id}`,
  });
}

export default async function RetoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const row = await getPortalChallenge(id);
  if (!row) notFound();
  return (
    <div className="container-site py-16 lg:py-24">
      <RetoDetail row={row} />
    </div>
  );
}
