export type InstrumentChoice =
  | { kind: "one"; id: string }
  | { kind: "pick"; ids: [string, string] }
  | { kind: "none" };

const one: Record<string, string> = {
  "automotriz-y-autopartes": "automotriz",
  agroindustria: "agricola-pecuaria",
  "alimentos-y-bebidas": "alimentos",
  "plasticos-y-hule": "plasticos",
  metalmecanica: "metalmecanica",
  "mueble-y-madera": "muebles",
  gastronomia: "gastronomia",
  "dispositivos-medicos": "dispositivos",
  construccion: "construccion",
  logistica: "logistica",
  "artes-graficas-y-empaque": "artes-graficas",
  quimica: "quimica",
  "tecnologia-y-servicios-de-ti": "tics",
  educacion: "educacion",
  inmobiliario: "inmobiliario",
  "servicios-financieros": "sofom",
};

export function instrumentChoice(slug: string): InstrumentChoice {
  if (slug === "textil-y-confeccion") return { kind: "pick", ids: ["textiles", "confeccion"] };
  if (slug === "turismo") return { kind: "pick", ids: ["turismo", "agencias"] };
  const id = one[slug];
  return id ? { kind: "one", id } : { kind: "none" };
}
