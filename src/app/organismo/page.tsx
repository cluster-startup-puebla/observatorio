import { Kicker } from "@/components/landing/atoms/kicker";
import { getDirectory } from "@/lib/memory-directory";
import { copyEventLinkAction } from "@/lib/organismo-actions";
import { readAccountId } from "@/lib/session";

export const instant = false;

export default async function OrganismoHome({
  searchParams,
}: {
  searchParams: Promise<{ enlace?: string | string[] }>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.enlace) ? params.enlace[0] : params.enlace;
  const token = raw ?? "";
  const id = await readAccountId();
  const account = id ? await getDirectory().getAccount(id) : null;
  const sector = account?.sectorSlug || "general";

  return (
    <header className="grid max-w-3xl gap-4">
      <Kicker>Organismo</Kicker>
      <h1 className="text-h1 text-ink">Tu evento</h1>
      <p className="text-body-lg text-ink-secondary">
        Carga invitaciones, copia el enlace y mira quién ya está en el CRM.
      </p>
      {token ? <p data-testid="enlace-evento">{`/${sector}?${token}`}</p> : null}
      <form action={copyEventLinkAction}>
        <button type="submit" className="btn btn-primary">
          Copiar enlace del evento
        </button>
      </form>
    </header>
  );
}
