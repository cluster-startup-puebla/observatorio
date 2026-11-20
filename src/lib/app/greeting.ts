export function dayPart(hour: number) {
  if (hour <= 11) return "buenos días";
  if (hour <= 18) return "buenas tardes";
  return "buenas noches";
}

export function mexicoHour(date: Date) {
  const parts = new Intl.DateTimeFormat("es-MX", {
    timeZone: "America/Mexico_City",
    hour: "numeric",
    hourCycle: "h23",
  }).formatToParts(date);
  const hour = parts.find((part) => part.type === "hour")?.value ?? "0";
  return Number(hour) % 24;
}

export function firstName(fullName: string) {
  const trimmed = fullName.trim();
  if (!trimmed) return "";
  return trimmed.split(/\s+/)[0] ?? "";
}
