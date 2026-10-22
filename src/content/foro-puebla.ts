/** Distribución general del Foro Puebla x Puebla (propuesta, no cifras oficiales). */
export const foroPueblaQuotasBySlug: Record<string, number> = {
  "automotriz-y-autopartes": 22,
  agroindustria: 18,
  turismo: 12,
  "alimentos-y-bebidas": 10,
  metalmecanica: 10,
  "plasticos-y-hule": 8,
  construccion: 8,
  logistica: 6,
  gastronomia: 6,
  "dispositivos-medicos": 5,
  "textil-y-confeccion": 5,
  "mueble-y-madera": 5,
  "artes-graficas-y-empaque": 5,
};

export function foroPueblaTotal() {
  return Object.values(foroPueblaQuotasBySlug).reduce((sum, value) => sum + value, 0);
}
