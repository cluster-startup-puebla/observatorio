const vistas = ["tabla", "tarjetas"] as const;
const estados = ["cargado", "contactado", "confirmo", "registrado", "llego", "no"] as const;
const origenes = ["excel", "manual", "enlace"] as const;

export type CrmVista = (typeof vistas)[number];

export function crmVista(value: string | undefined): CrmVista {
  return value === "tarjetas" ? "tarjetas" : "tabla";
}

export function crmEstado(value: string | undefined) {
  return estados.find((item) => item === value) ?? "";
}

export function crmOrigen(value: string | undefined) {
  return origenes.find((item) => item === value) ?? "";
}

export function crmHref(input: {
  vista?: string;
  estado?: string;
  origen?: string;
  page?: number;
}) {
  const params = new URLSearchParams();
  const vista = crmVista(input.vista);
  if (vista !== "tabla") params.set("vista", vista);
  if (input.estado) params.set("estado", input.estado);
  if (input.origen) params.set("origen", input.origen);
  if (input.page && input.page > 1) params.set("page", String(input.page));
  const query = params.toString();
  return query ? `/admin/crm?${query}` : "/admin/crm";
}

export const crmEstados = estados;
export const crmOrigenes = origenes;
