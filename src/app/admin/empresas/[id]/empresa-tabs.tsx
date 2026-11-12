"use client";

import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { companyTabs } from "@/lib/admin/empresas/tabs";
import { MiembrosSection } from "./miembros-section";
import { PaseSection } from "./pase-section";
import { RespuestasSection } from "./respuestas-section";
import { SectorSection } from "./sector-section";
import { TamanoSection } from "./tamano-section";

type Convener = { name: string; href: string };
type Member = { id: string; name: string; email: string; role: string };

export function EmpresaTabs({
  active,
  id,
  sourceLabel,
  acceptor,
  conveners,
  sectorSource,
  admittedAt,
  hasLink,
  employeeLabel,
  member,
  lines,
  assetId,
}: {
  active: string;
  id: string;
  sourceLabel: string;
  acceptor: string;
  conveners: Convener[];
  sectorSource: string;
  admittedAt: string | null;
  hasLink: boolean;
  employeeLabel: string;
  member: Member;
  lines: { key: string; prompt: string; label: string }[];
  assetId: string | null;
}) {
  const router = useRouter();
  return (
    <Tabs key={active} defaultValue={active} className="mt-6" onValueChange={(value) => router.replace(`?tab=${value}`)}>
      <TabsList variant="line">
        {companyTabs.map(({ value, label }) => (
          <TabsTrigger key={value} value={value} data-testid={`tab-${value}`}>
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="sector">
        <SectorSection
          id={id}
          source_label={sourceLabel}
          acceptor={acceptor}
          conveners={conveners}
          sector_source={sectorSource}
          admitted_at={admittedAt}
          has_link={hasLink}
        />
      </TabsContent>
      <TabsContent value="tamano">
        <TamanoSection employee_label={employeeLabel} />
      </TabsContent>
      <TabsContent value="miembros">
        <MiembrosSection member={member} />
      </TabsContent>
      <TabsContent value="respuestas">
        <RespuestasSection lines={lines} />
      </TabsContent>
      <TabsContent value="pase">
        <PaseSection assetId={assetId} />
      </TabsContent>
    </Tabs>
  );
}
