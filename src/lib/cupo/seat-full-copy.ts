export function seatFullCopy(code: string | undefined) {
  if (!code) return "";
  if (code.includes("sector_lleno")) return "Este sector ya está lleno. La persona sigue en espera.";
  if (code === "aceptar") return "No se pudo aceptar.";
  return "";
}
