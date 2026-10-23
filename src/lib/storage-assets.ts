const logoExt: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export function companyLogoObjectPath(profileId: string, contentType: string) {
  const ext = logoExt[contentType];
  if (!ext) throw new Error("tipo de imagen no permitido");
  return `${profileId}/logo.${ext}`;
}

export function logoObjectPath(organizationId: string, contentType: string) {
  const ext = logoExt[contentType];
  if (!ext) throw new Error("tipo de imagen no permitido");
  return `${organizationId}/logo.${ext}`;
}

export function passObjectPath(profileId: string) {
  return `${profileId}/pass.png`;
}

export function contentObjectPath(slug: string, filename: string) {
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error("slug inválido");
  if (!/^[a-z0-9.-]+\.(png|jpg|webp)$/.test(filename)) throw new Error("archivo inválido");
  return `${slug}/${filename}`;
}
