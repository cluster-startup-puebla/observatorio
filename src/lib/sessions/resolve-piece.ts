export type PieceKind = "organismo" | "sector" | "ninguno";

export function pieceKind(input: { owner: boolean; sector: boolean }): PieceKind {
  if (input.owner) return "organismo";
  if (input.sector) return "sector";
  return "ninguno";
}
