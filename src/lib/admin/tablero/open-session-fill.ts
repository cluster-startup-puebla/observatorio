import type { Seat } from "./sector-fill";

/** Session without sector quotas: one global cupo from capacity_max. */
export function openSessionFill(capacityMax: number, seats: Seat[]) {
  const active = seats.filter((seat) => !seat.released);
  const ocupados = active.filter((seat) => seat.status === "confirmed").length;
  const pendientes = active.filter((seat) => seat.status === "pending").length;
  const cupo = Math.max(0, capacityMax);
  return {
    cupo,
    ocupados,
    pendientes,
    fuera: 0,
    omitidos: [] as { sector: string; slug: string; personas: number; pendientes: number }[],
    rows: cupo > 0
      ? [{ sector: "Cupo de la sesión", slug: "sesion", cupo, ocupados, pendientes }]
      : [],
  };
}
