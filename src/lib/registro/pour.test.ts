import { expect, it } from "vitest";
import { toEmpresarioProfile } from "./pour";

it("copia la fila al perfil y no trae logo", () => {
  const profile = toEmpresarioProfile({
    full_name: "Ana",
    job_title: "Directora",
    whatsapp: null,
    company_name: "Norte",
    market_size: "local",
    employee_band: "1–10",
    municipality: "Puebla",
    sector_slug: "alimentos-y-bebidas",
    referral_source: "Un organismo",
    session_interest: "Ver el diagnóstico",
    invite_token: null,
  });
  expect(profile).toEqual({
    fullName: "Ana",
    jobTitle: "Directora",
    whatsapp: "",
    companyName: "Norte",
    marketSize: "local",
    employeeBand: "1–10",
    municipality: "Puebla",
    sectorSlug: "alimentos-y-bebidas",
    referralSource: "Un organismo",
    sessionInterest: "Ver el diagnóstico",
  });
  expect(profile).not.toHaveProperty("logo");
});
