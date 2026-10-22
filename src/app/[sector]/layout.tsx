import { OrgShell } from "@/components/organismo/shell";
import { requireOrgMember } from "@/lib/organismo/member";
import { ownerBySlug } from "@/lib/organismo/owner";

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
  return (
    <OrgShell slug={owner.slug} name={owner.name} email={account.email}>
      {children}
    </OrgShell>
  );
}
