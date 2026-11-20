const domain = /^(https:\/\/)?([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;

export function websiteError(value: string): string | null {
  if (!value || /\s/.test(value) || value.length > 200 || !domain.test(value)) return "sitio";
  return null;
}
