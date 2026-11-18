import { redirect } from "next/navigation";

export const instant = false;

type Search = Promise<Record<string, string | string[] | undefined>>;

function text(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export default async function RegistroPage({ searchParams }: { searchParams: Search }) {
  const params = await searchParams;
  const query = new URLSearchParams();
  const sector = text(params.sector);
  const invitacion = text(params.invitacion);
  if (sector) query.set("sector", sector);
  if (invitacion) query.set("invitacion", invitacion);
  const suffix = query.size ? `?${query.toString()}` : "";
  redirect(`/crear-cuenta${suffix}`);
}
