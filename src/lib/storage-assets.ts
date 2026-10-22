const logoExt: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export function logoObjectPath(organizationId: string, contentType: string) {
  const ext = logoExt[contentType];
  if (!ext) throw new Error("tipo de imagen no permitido");
  return `${organizationId}/logo.${ext}`;
}

export function passObjectPath(profileId: string) {
  return `${profileId}/pass.png`;
}
