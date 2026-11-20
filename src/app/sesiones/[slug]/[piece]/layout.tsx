import { OrgShell } from "@/components/organismo/shell";
import { requireOrgMember } from "@/lib/organismo/member";
import { ownerBySlug } from "@/lib/organismo/owner";
import { resolveOrgLogo } from "@/lib/organismo/resolve-logo";
import { requirePublicSession } from "@/lib/sessions/require-session";

export const instant = false;

export default async function SessionPieceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string; piece: string }>;
}) {
  const { slug, piece } = await params;
  const session = await requirePublicSession(slug);
  const owner = await ownerBySlug(piece);
  if (!owner) return children;
  const account = await requireOrgMember(owner);
  const logo = await resolveOrgLogo(account.id);
  return (
    <OrgShell
      slug={owner.slug}
      sessionSlug={session.publicSlug}
      name={owner.name}
      email={account.email}
      logoSrc={logo?.src}
      brandColor={owner.brandColor}
    >
      {children}
    </OrgShell>
  );
}
