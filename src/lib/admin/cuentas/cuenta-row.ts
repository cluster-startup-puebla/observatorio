export function cuentaDisplayName(name: string, orgName: string) {
  return name.trim() || orgName.trim() || "—";
}

export function cuentaMarkSrc(organizationId: string, hasLogo: boolean) {
  if (!organizationId || !hasLogo) return "";
  return `/api/admin/organismos/${organizationId}/logo`;
}

export function orgHasLogo(assets: { purpose?: string }[] | null) {
  return Array.isArray(assets) && assets.some((asset) => asset.purpose === "organization_logo");
}
