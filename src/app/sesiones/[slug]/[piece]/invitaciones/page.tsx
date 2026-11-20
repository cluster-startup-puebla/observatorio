import { InviteModes } from "@/components/organismo/invite-modes";
import { InvitePreview } from "@/components/organismo/invite-preview";
import { readSessionAccount } from "@/lib/auth/session-account";
import { readInviteLink } from "@/lib/organismo/invite-link-cookie";
import { resolveOrgLogoSrc } from "@/lib/organismo/resolve-logo";
import { requirePieceOwner } from "@/lib/sessions/require-session";
import { sectors } from "@/lib/sectors";

export const instant = false;

export default async function InvitacionesPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; piece: string }>;
  searchParams: Promise<{ error?: string; modo?: string }>;
}) {
  const { slug, piece } = await params;
  const { session, owner } = await requirePieceOwner(slug, piece);
  const query = await searchParams;
  const link = await readInviteLink(owner.slug);
  const named = sectors.find((item) => item.slug === link?.sector);
  const account = await readSessionAccount();
  const logoSrc = account ? await resolveOrgLogoSrc(account.id) : undefined;
  return (
    <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,42rem)_22rem]">
      <div className="grid gap-6">
        <header className="grid gap-2">
          <h1 className="text-h2 text-ink">Invitaciones</h1>
          <p className="text-body text-ink-secondary">Tres formas de invitar. Elige una.</p>
        </header>
        <InviteModes
          slug={owner.slug}
          sessionSlug={session.publicSlug}
          mode={query.modo ?? "mano"}
          error={query.error}
        />
      </div>
      <InvitePreview
        orgName={owner.name}
        sectorName={named?.name ?? null}
        logoSrc={logoSrc ?? null}
        href={link?.url ?? null}
      />
    </div>
  );
}
