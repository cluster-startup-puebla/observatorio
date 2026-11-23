export type ProfileGap = {
  id: "logo" | "website" | "verify";
  label: string;
};

const pieces: ProfileGap[] = [
  { id: "logo", label: "Logo" },
  { id: "website", label: "Sitio web" },
  { id: "verify", label: "Confirmar correo" },
];

export function profileGaps(input: { hasLogo: boolean; website: string; emailConfirmed?: boolean }) {
  const confirmed = input.emailConfirmed !== false;
  const gaps = pieces.filter((piece) => {
    if (piece.id === "logo") return !input.hasLogo;
    if (piece.id === "website") return input.website.trim().length === 0;
    return !confirmed;
  });
  const missing = gaps.length;
  return {
    gaps,
    total: pieces.length,
    counter: missing === 0 ? `0/${pieces.length}` : `1/${missing}`,
  };
}

export function gapCaption(missing: number) {
  return missing === 1 ? "acción faltante" : "pendientes";
}

export function gapBar(missing: number) {
  const done = Math.max(pieces.length - missing, 0);
  return Math.round((done / pieces.length) * 100);
}
