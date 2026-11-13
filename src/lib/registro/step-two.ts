import { companySizes } from "@/content/landing";
import { parseMarketSize } from "@/lib/onboarding/market-sizes";
import { isPueblaMunicipio } from "@/lib/onboarding/puebla-municipios";
import { acceptedIndustry } from "@/lib/sectors";

export type StepTwo = {
  companyName: string;
  marketSize: string;
  employeeBand: string;
  municipality: string;
  sectorSlug: string;
  referralSource: string;
  sessionInterest: string;
  terms: boolean;
};

export function stepTwoIssue(
  input: StepTwo,
):
  | "empresa"
  | "mercado"
  | "empleados"
  | "municipio"
  | "sector"
  | "referencia"
  | "interes"
  | "terminos"
  | null {
  if (input.companyName.length < 2) return "empresa";
  if (!parseMarketSize(input.marketSize)) return "mercado";
  if (!companySizes.includes(input.employeeBand)) return "empleados";
  if (!isPueblaMunicipio(input.municipality)) return "municipio";
  if (!acceptedIndustry(input.sectorSlug)) return "sector";
  if (input.referralSource.length < 2) return "referencia";
  if (input.sessionInterest.length < 2 || input.sessionInterest.length > 500) return "interes";
  if (input.terms !== true) return "terminos";
  return null;
}
