import Link from "next/link";
import { BadgeCheck, ImageIcon, Quote, Route, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoItem } from "./info-item";

function initials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "—";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
}

export function EmpresaHeaderCard({
  id,
  legalName,
  sourceLabel,
  sectorId,
  sectorName,
  approvalLabel,
  acceptor,
  employeeLabel,
  referral,
  showLogo,
}: {
  id: string;
  legalName: string;
  sourceLabel: string;
  sectorId: string;
  sectorName: string;
  approvalLabel: string;
  acceptor: string;
  employeeLabel: string;
  referral: string;
  showLogo: boolean;
}) {
  return (
    <Card className="mb-6 bg-elevated text-ink ring-line">
      <CardHeader className="flex flex-col items-start justify-between gap-6 lg:flex-row">
        <div className="flex min-w-0 items-start gap-4">
          <Avatar className="size-20 h-20 w-20">
            <AvatarImage src={`/api/admin/empresas/${id}/logo`} alt={legalName} />
            <AvatarFallback className="bg-elevated text-lg text-ink">{initials(legalName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <CardTitle className="text-2xl break-words text-ink">{legalName}</CardTitle>
            <p className="mt-1 text-sm text-ink-secondary">{sourceLabel}</p>
            {sectorId ? (
              <Badge variant="outline" className="mt-2 border-line bg-elevated text-ink">
                <Link href={`/admin/sectores/${sectorId}`}>{sectorName || "Sector"}</Link>
              </Badge>
            ) : null}
          </div>
        </div>
        <div className="rounded-lg border border-line bg-surface-subtle px-4 py-3">
          <div className="flex items-center gap-3">
            <BadgeCheck className="h-5 w-5 shrink-0 text-ink" />
            <p className="text-2xl font-semibold text-ink">{approvalLabel}</p>
          </div>
          <p className="mt-1 text-xs uppercase tracking-wide text-ink-secondary">Aprobación</p>
          <p className="text-sm text-ink">{acceptor}</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <InfoItem icon={Users} label="Tamaño" value={employeeLabel || "—"} />
          <InfoItem icon={Route} label="Cómo llegó" value={sourceLabel || "—"} />
          {referral.trim() ? <InfoItem icon={Quote} label="Referencia" value={referral} /> : null}
          <InfoItem icon={ImageIcon} label="Logo el día del evento" value={showLogo ? "Sí" : "No"} />
        </div>
      </CardContent>
    </Card>
  );
}
