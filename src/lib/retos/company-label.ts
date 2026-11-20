export function companyLabel(input: { showCompany: boolean; snapshot: string | null }) {
  if (input.showCompany && input.snapshot?.trim()) return input.snapshot.trim();
  return "Licitación anónima";
}
