import { companySizes } from "@/content/landing";
import { acceptedIndustry } from "@/lib/sectors";
import type { EmpresarioValues } from "./empresario-steps";
import { parseMarketSize } from "./market-sizes";
import { isPueblaMunicipio } from "./puebla-municipios";

const serverMessages: Record<string, string> = {
  nombre: "Escribe tu nombre.",
  puesto: "Escribe tu puesto.",
  whatsapp: "El WhatsApp lleva de 10 a 15 dígitos, o déjalo vacío.",
  empresa: "Escribe el nombre de la empresa.",
  mercado: "Elige el tamaño de mercado.",
  empleados: "Elige el tamaño de la empresa.",
  municipio: "Elige un municipio de Puebla.",
  sector: "Elige o escribe la industria.",
  referencia: "Cuéntanos cómo te enteraste.",
  interes: "Cuéntanos qué te interesa de esta sesión. Máximo 500 caracteres.",
  logo: "Sube un logo PNG, JPG o WEBP de hasta 2 MB.",
  cuenta: "La sesión expiró. Entra de nuevo.",
};

export function serverIssue(code: string | undefined) {
  if (!code) return "";
  return serverMessages[code] ?? "No se pudo guardar. Revisa los datos e intenta de nuevo.";
}

function personIssue(values: EmpresarioValues) {
  if (values.fullName.trim().length < 2) return serverMessages.nombre;
  if (values.jobTitle.trim().length < 2) return serverMessages.puesto;
  const digits = values.whatsapp.replace(/\D/g, "");
  if (digits.length > 0 && (digits.length < 10 || digits.length > 15)) {
    return serverMessages.whatsapp;
  }
  return null;
}

function companyIssue(values: EmpresarioValues) {
  if (values.companyName.trim().length < 2) return serverMessages.empresa;
  if (!parseMarketSize(values.marketSize)) return serverMessages.mercado;
  if (!companySizes.includes(values.employeeBand)) return serverMessages.empleados;
  if (!isPueblaMunicipio(values.municipality)) return serverMessages.municipio;
  if (!acceptedIndustry(values.sectorSlug)) return serverMessages.sector;
  if (values.showLogo && !values.hasLogo) return serverMessages.logo;
  return null;
}

function referralIssue(values: EmpresarioValues) {
  if (values.referralSource.trim().length < 2) return serverMessages.referencia;
  const interest = values.sessionInterest.trim();
  if (interest.length < 2 || interest.length > 500) return serverMessages.interes;
  return null;
}

export function stepIssue(step: number, values: EmpresarioValues) {
  if (step === 0) return personIssue(values);
  if (step === 1) return companyIssue(values);
  return referralIssue(values);
}
