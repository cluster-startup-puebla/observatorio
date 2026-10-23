import { redirect } from "next/navigation";
import { mesaHref } from "@/lib/admin/mesa/href";

export default async function MesaRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") query.set(key, value);
  }
  const suffix = query.size ? `?${query}` : "";
  redirect(`${mesaHref}${suffix}`);
}
