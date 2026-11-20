export type ProfileGap = {
  id: "logo" | "website";
  label: string;
};

const pieces: ProfileGap[] = [
  { id: "logo", label: "Logo" },
  { id: "website", label: "Sitio web" },
];

export function profileGaps(input: { hasLogo: boolean; website: string }) {
  const gaps = pieces.filter((piece) => {
    if (piece.id === "logo") return !input.hasLogo;
    return input.website.trim().length === 0;
  });
  const total = pieces.length;
  return { gaps, total, counter: `${gaps.length}/${total}` };
}
