const bands = ["1_10", "11_50", "51_250", "250_plus"] as const;

export function companyDraft(input: {
  legalName: string;
  sectorId: string;
  band: string;
  referral: string;
  profileId: string;
}) {
  const legalName = input.legalName.trim();
  const referral = input.referral.trim();
  if (legalName.length < 2 || legalName.length > 160) return { ok: false as const, reason: "razón social inválida" };
  if (!bands.includes(input.band as (typeof bands)[number])) return { ok: false as const, reason: "tamaño inválido" };
  if (!input.sectorId || !input.profileId) return { ok: false as const, reason: "faltan sector o empresario" };
  if (referral.length < 2 || referral.length > 160) return { ok: false as const, reason: "referencia inválida" };
  return {
    ok: true as const,
    legal_name: legalName,
    sector_id: input.sectorId,
    employee_band: input.band,
    referral_source: referral,
    profile_id: input.profileId,
    sector_source: "chosen" as const,
  };
}
