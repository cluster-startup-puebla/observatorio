import { bandLabel } from "@/lib/admin/empresas/band-label";
import { passWhen } from "./pass-face";

export type PassFace = {
  name: string;
  email: string;
  jobTitle: string;
  whatsapp: string;
  companyName: string;
  companyHref: string;
  sectorName: string;
  sectorHref: string;
  employees: string;
  municipality: string;
  interest: string;
  sessionLabel: string;
  sessionHref: string;
  sessionShort: string;
  issued: string;
  arrived: string;
  scanner: string;
  assetId: string;
};

type FaceProfile = {
  full_name: string | null;
  email: string | null;
  job_title: string | null;
  whatsapp: string | null;
};

type FaceCompany = {
  id: string;
  legal_name: string;
  employee_band: string;
  municipality: string | null;
  session_interest: string | null;
  sector_id: string;
};

type FaceSector = { id: string; name: string | null };

export function buildPassFace(input: {
  profileId: string;
  assetId: string;
  issuedAt: string;
  arrivedAt: string;
  scanner: string;
  profile: FaceProfile | null;
  company: FaceCompany | null;
  sector: FaceSector | null;
}): PassFace {
  const name = input.profile?.full_name?.trim() || input.profile?.email || input.profileId;
  return {
    name,
    email: input.profile?.email ?? "",
    jobTitle: input.profile?.job_title ?? "",
    whatsapp: input.profile?.whatsapp ?? "",
    companyName: input.company?.legal_name ?? "",
    companyHref: input.company ? `/admin/empresas/${input.company.id}` : "",
    sectorName: input.sector?.name ?? "",
    sectorHref: input.sector ? `/admin/sectores/${input.sector.id}` : "",
    employees: bandLabel(input.company?.employee_band ?? ""),
    municipality: input.company?.municipality ?? "",
    interest: input.company?.session_interest ?? "",
    sessionLabel: "Sin sesión",
    sessionHref: "",
    sessionShort: "—",
    issued: passWhen(input.issuedAt),
    arrived: passWhen(input.arrivedAt),
    scanner: input.scanner,
    assetId: input.assetId,
  };
}
