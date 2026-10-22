import { OrgShell } from "@/components/organismo/shell";
import { requireOrgMember } from "@/lib/organismo/member";
import { ownerBySlug } from "@/lib/organismo/owner";
import { resolveOrgLogoSrc } from "@/lib/organismo/resolve-logo";

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
  const logoSrc = await resolveOrgLogoSrc(account.id);
  return (
    <OrgShell slug={owner.slug} name={owner.name} email={account.email} logoSrc={logoSrc}>
      {children}
    </OrgShell>
  );
}
