const namedSearchKeys = new Set([
  "cuenta",
  "codigo",
  "completas",
  "descarga",
  "enlace",
  "enviado",
  "error",
  "estatus",
  "nombre",
  "persona",
  "pregunta",
  "ref",
  "rol",
  "sector",
  "ver",
]);

export function eventToken(searchParams: { [key: string]: string | string[] | undefined }) {
  for (const key of Object.keys(searchParams)) {
    if (!key || namedSearchKeys.has(key)) continue;
    return key;
  }
  return null;
}
