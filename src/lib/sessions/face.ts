export const sessionTimeZones = [
  "America/Mexico_City",
  "America/Bahia_Banderas",
  "America/Cancun",
  "America/Chihuahua",
  "America/Ciudad_Juarez",
  "America/Hermosillo",
  "America/Matamoros",
  "America/Mazatlan",
  "America/Merida",
  "America/Monterrey",
  "America/Ojinaga",
  "America/Tijuana",
] as const;

export type SessionZone = (typeof sessionTimeZones)[number];

const months = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export function isSessionZone(value: string): value is SessionZone {
  return (sessionTimeZones as readonly string[]).includes(value);
}

export function sessionOnLabel(iso: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) return iso;
  const month = months[Number(match[2]) - 1];
  const day = Number(match[3]);
  if (!month || day < 1) return iso;
  return `${day} de ${month} de ${match[1]}`;
}

export function clockFace(value: string) {
  const match = /^(\d{2}:\d{2})/.exec(value);
  return match ? match[1] : value;
}

export function sessionWhen(input: {
  sessionOn: string;
  starts: string;
  ends: string;
  timeZone: string;
}) {
  const hours = `${clockFace(input.starts)}–${clockFace(input.ends)}`;
  return `${sessionOnLabel(input.sessionOn)} · ${hours} · ${input.timeZone}`;
}

export function currentOption(row: {
  id: string;
  venue: string;
  session_on: string;
  starts_local: string;
  ends_local: string;
}) {
  const hours = `${clockFace(row.starts_local)}–${clockFace(row.ends_local)}`;
  return { id: row.id, label: `${row.venue} · ${sessionOnLabel(row.session_on)} · ${hours}` };
}
