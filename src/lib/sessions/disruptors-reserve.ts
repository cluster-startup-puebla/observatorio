import { disruptorsReserveHref, disruptorsSlug } from "@/content/disruptors";
import { reserveHref } from "@/lib/sectors";

export function sessionReserveHref(
  sessionSlug: string | undefined,
  sectorSlug: string,
  token?: string | null,
) {
  if (sessionSlug !== disruptorsSlug) return reserveHref(`/${sectorSlug}`, token);
  const query = new URLSearchParams();
  if (sectorSlug) query.set("sector", sectorSlug);
  if (token) query.set("invitacion", token);
  const text = query.toString();
  return text ? `${disruptorsReserveHref}?${text}` : disruptorsReserveHref;
}
