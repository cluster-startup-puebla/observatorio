const brands = new Set(["outlook", "hotmail", "live", "msn"]);

export function isMicrosoftMailbox(email: string) {
  const domain = email.trim().toLowerCase().split("@")[1] ?? "";
  const [brand, ...rest] = domain.split(".");
  if (!brands.has(brand) || rest.length === 0 || rest.length > 2) return false;
  return rest.every((label) => /^[a-z]{2,3}$/.test(label));
}
