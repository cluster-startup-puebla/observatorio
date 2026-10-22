import { CopyLink } from "@/components/organismo/copy-link";
import { LinkCards } from "@/components/organismo/link-cards";
import { OpensChart } from "@/components/organismo/opens-chart";
import { loadOrgHome } from "@/lib/organismo/load-home";

export async function OrgHome({
  slug,
  name,
  orgId,
  url,
  sector,
}: {
  slug: string;
  name: string;
  orgId: string;
  url?: string;
  sector?: string;
}) {
  const stats = await loadOrgHome(orgId);
  return (
    <div className="grid gap-6">
      <header className="grid gap-2">
        <h1 className="text-h1 text-ink">{name}</h1>
        <p className="text-body text-ink-secondary">Panel de {slug}</p>
      </header>
      <CopyLink url={url} sector={sector} />
      <LinkCards opens={stats.opens} conversions={stats.conversions} rate={stats.rate} />
      <OpensChart bars={stats.bars} />
    </div>
  );
}
