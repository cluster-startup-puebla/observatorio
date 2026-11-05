import { OrgShell } from "@/components/organismo/shell";
import { monochromeInkFor } from "@/lib/organismo/logo-mark";
import { requireOrgMember } from "@/lib/organismo/member";
import { ownerBySlug } from "@/lib/organismo/owner";
import { resolveOrgLogo } from "@/lib/organismo/resolve-logo";

export const instant = false;

export default async function SectorLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ sector: string }>;
}) {
  const { sector } = await params;
  const owner = await ownerBySlug(sector);
  if (!owner) return children;
  const account = await requireOrgMember(owner);
  const logo = await resolveOrgLogo(account.id);
  const monochromeInk = await monochromeInkFor(logo, owner.brandColor);
  return (
    <OrgShell
      slug={owner.slug}
      name={owner.name}
      email={account.email}
      logoSrc={logo?.src}
      brandColor={owner.brandColor}
      monochromeInk={monochromeInk}
    >
      {children}
    </OrgShell>
  );
}
