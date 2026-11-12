import Link from "next/link";
import { ImageIcon, Quote, Route, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanyMark } from "./company-mark";
import { InfoItem } from "./info-item";

export function EmpresaHeaderCard({
  id,
  legalName,
  sourceLabel,
  sectorId,
  sectorName,
  employeeLabel,
  referral,
  showLogo,
}: {
  id: string;
  legalName: string;
  sourceLabel: string;
  sectorId: string;
  sectorName: string;
  employeeLabel: string;
  referral: string;
  showLogo: boolean;
}) {
  return (
    <Card className="mb-6 bg-elevated text-ink ring-line">
      <CardHeader className="flex flex-col items-start gap-6 lg:flex-row lg:items-center">
        <CompanyMark id={id} name={legalName} />
        <div className="min-w-0">
          <CardTitle className="text-2xl break-words text-ink">{legalName}</CardTitle>
          <p className="mt-1 text-sm text-ink-secondary">{sourceLabel}</p>
          {sectorId ? (
            <Badge variant="outline" className="mt-2 border-line bg-elevated text-ink">
              <Link href={`/admin/sectores/${sectorId}`}>{sectorName || "Sector"}</Link>
            </Badge>
          ) : null}
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
