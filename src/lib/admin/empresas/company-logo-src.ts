export function companyLogoSrc(companyId: string, hasFile: boolean) {
  if (!hasFile) return "";
  return `/api/admin/empresas/${companyId}/logo`;
}
