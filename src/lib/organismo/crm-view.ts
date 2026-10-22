import { orgEstado, type OrgEstado } from "./estado";

export function orgView(raw: string | undefined) {
  return raw === "tarjetas" ? "tarjetas" : "tabla";
}

export function filterOrgCrm<T extends { status: string }>(rows: T[], estado: string | undefined) {
  return rows.filter((row) => {
    const bucket = orgEstado(row.status);
    if (!bucket) return false;
    if (estado === "pendiente" || estado === "contactado" || estado === "confirmado") {
      return bucket === (estado as OrgEstado);
    }
    return true;
  });
}
