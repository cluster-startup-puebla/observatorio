import { stepIssue } from "./step-issue";

export type EmpresarioValues = {
  fullName: string;
  jobTitle: string;
  whatsapp: string;
  companyName: string;
  website: string;
  marketSize: string;
  employeeBand: string;
  municipality: string;
  sectorSlug: string;
  referralSource: string;
  sessionInterest: string;
  showLogo: boolean;
  hasLogo: boolean;
};

export function emptyEmpresarioValues(sectorSlug: string): EmpresarioValues {
  return {
    fullName: "",
    jobTitle: "",
    whatsapp: "",
    companyName: "",
    website: "",
    marketSize: "",
    employeeBand: "",
    municipality: "",
    sectorSlug,
    referralSource: "",
    sessionInterest: "",
    showLogo: false,
    hasLogo: false,
  };
}

export function stepReady(step: number, values: EmpresarioValues) {
  return stepIssue(step, values) === null;
}
