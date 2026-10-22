import { companySizes } from "@/content/landing";
import { sectors } from "@/lib/sectors";
import { parseMarketSize } from "./market-sizes";
import { isPueblaMunicipio } from "./puebla-municipios";

export type EmpresarioProfile = {
  fullName: string;
  jobTitle: string;
  whatsapp: string;
  companyName: string;
  marketSize: string;
  employeeBand: string;
  municipality: string;
  sectorSlug: string;
  referralSource: string;
  sessionInterest: string;
};

export function parseEmpresarioForm(form: FormData): EmpresarioProfile {
  return {
    fullName: String(form.get("fullName") ?? "").trim(),
    jobTitle: String(form.get("jobTitle") ?? "").trim(),
    whatsapp: String(form.get("whatsapp") ?? "").replace(/\D/g, ""),
    companyName: String(form.get("companyName") ?? "").trim(),
    marketSize: String(form.get("marketSize") ?? "").trim(),
    employeeBand: String(form.get("employeeBand") ?? "").trim(),
    municipality: String(form.get("municipality") ?? "").trim(),
    sectorSlug: String(form.get("sector") ?? "").trim(),
    referralSource: String(form.get("referralSource") ?? "").trim(),
    sessionInterest: String(form.get("sessionInterest") ?? "").trim(),
  };
}

export function empresarioErrors(input: EmpresarioProfile): string | null {
  if (input.fullName.length < 2) return "nombre";
  if (input.jobTitle.length < 2) return "puesto";
  if (input.whatsapp && (input.whatsapp.length < 10 || input.whatsapp.length > 15)) return "whatsapp";
  if (input.companyName.length < 2) return "empresa";
  if (!parseMarketSize(input.marketSize)) return "mercado";
  if (!companySizes.includes(input.employeeBand)) return "empleados";
  if (!isPueblaMunicipio(input.municipality)) return "municipio";
  if (!sectors.some((sector) => sector.slug === input.sectorSlug)) return "sector";
  if (input.referralSource.length < 2) return "referencia";
  if (input.sessionInterest.length < 2) return "interes";
  return null;
}
