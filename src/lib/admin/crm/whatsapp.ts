export function whatsappHref(digits: string) {
  const clean = digits.replace(/\D/g, "");
  if (clean.length < 10) return "";
  const number = clean.length === 10 ? `52${clean}` : clean;
  return `https://wa.me/${number}`;
}
