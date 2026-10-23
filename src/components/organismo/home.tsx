import { CopyLink } from "@/components/organismo/copy-link";
import { loadCurrentSessions } from "@/lib/organismo/current-sessions";
import { LinkCards } from "@/components/organismo/link-cards";
import { OpensChart } from "@/components/organismo/opens-chart";
import { SectorCuts } from "@/components/organismo/sector-cuts";
import { loadOrgHome } from "@/lib/organismo/load-home";
import { sectors } from "@/lib/sectors";

export async function OrgHome({
  slug,
  name,
  orgId,
  url,
  sector,
  failed,
  ready,
  corte,
}: {
  slug: string;
  name: string;
  orgId: string;
  url?: string;
  sector?: string;
  failed?: boolean;
  ready?: boolean;
  corte?: string;
}) {
  const chosen = sectors.find((item) => item.slug === corte);
  const [stats, sessions] = await Promise.all([loadOrgHome(orgId, chosen?.slug), loadCurrentSessions()]);
  const hint = chosen
    ? `Visitas de ${chosen.name} en los últimos 14 días.`
    : "Visitas al enlace en los últimos 14 días.";
  return (
    <div className="grid gap-6">
      <header className="grid gap-2">
        <h1 className="text-h1 text-ink">{name}</h1>
        <p className="text-body text-ink-secondary">Panel de {slug}</p>
      </header>
      <CopyLink url={url} sector={sector} failed={failed} ready={ready} sessions={sessions} />
      <LinkCards opens={stats.opens} conversions={stats.conversions} rate={stats.rate} />
      <SectorCuts orgSlug={slug} cuts={stats.cuts} active={chosen?.slug} />
      <OpensChart bars={stats.bars} hint={hint} />
    </div>
  );
}
