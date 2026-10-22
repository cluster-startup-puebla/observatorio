import { companySizes } from "@/content/landing";
import { parseMarketSize } from "./market-sizes";
import { isPueblaMunicipio } from "./puebla-municipios";
import { sectors } from "@/lib/sectors";

export type EmpresarioValues = {
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

export function emptyEmpresarioValues(sectorSlug: string): EmpresarioValues {
  return {
    fullName: "",
    jobTitle: "",
    whatsapp: "",
    companyName: "",
    marketSize: "",
    employeeBand: "",
    municipality: "",
    sectorSlug,
    referralSource: "",
    sessionInterest: "",
  };
}

export function stepReady(step: number, values: EmpresarioValues) {
  const digits = values.whatsapp.replace(/\D/g, "");
  if (step === 0) {
    return (
      values.fullName.trim().length >= 2 &&
      values.jobTitle.trim().length >= 2 &&
      (digits.length === 0 || (digits.length >= 10 && digits.length <= 15))
    );
  }
  if (step === 1) {
    return (
      values.companyName.trim().length >= 2 &&
      Boolean(parseMarketSize(values.marketSize)) &&
      companySizes.includes(values.employeeBand) &&
      isPueblaMunicipio(values.municipality) &&
      sectors.some((sector) => sector.slug === values.sectorSlug)
    );
  }
  return values.referralSource.trim().length >= 2 && values.sessionInterest.trim().length >= 2;
}
