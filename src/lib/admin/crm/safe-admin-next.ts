export function safeAdminNext(value: string, fallback: string) {
  if (!value.startsWith("/admin/") || value.startsWith("//") || value.includes("://")) return fallback;
  return value;
}
