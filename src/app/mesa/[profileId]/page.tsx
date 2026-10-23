import { redirect } from "next/navigation";
import { mesaHref } from "@/lib/admin/mesa/href";

export default async function MesaDetailRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ profileId: string }>;
  searchParams: Promise<{ nombre?: string }>;
}) {
  const { profileId } = await params;
  const query = await searchParams;
  const suffix = query.nombre ? `?nombre=${encodeURIComponent(query.nombre)}` : "";
  redirect(`${mesaHref}/${profileId}${suffix}`);
}
