export function isPublicMediaPurpose(purpose: string) {
  return purpose === "content_image";
}

export function mediaPreviewPath(purpose: string, id: string) {
  if (isPublicMediaPurpose(purpose)) return `/api/medios/${id}`;
  return `/api/admin/medios/${id}/archivo`;
}
