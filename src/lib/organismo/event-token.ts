const namedSearchKeys = new Set([
  "cuenta",
  "codigo",
  "completas",
  "descarga",
  "enlace",
  "enviado",
  "error",
  "invitacion",
  "estatus",
  "nombre",
  "persona",
  "pregunta",
  "ref",
  "rol",
  "sector",
  "sesion",
  "ver",
]);

export function eventToken(searchParams: { [key: string]: string | string[] | undefined }) {
  for (const key of Object.keys(searchParams)) {
    if (!key || namedSearchKeys.has(key)) continue;
    return key;
  }
  return null;
}

export function tokenFromQuery(query: { forEach(fn: (value: string, key: string) => void): void }) {
  const bag: Record<string, string> = {};
  query.forEach((value, key) => {
    bag[key] = value;
  });
  return eventToken(bag);
}
