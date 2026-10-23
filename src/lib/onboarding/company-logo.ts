export function logoUploadDecision(input: { show: boolean; hasFile: boolean }) {
  if (!input.hasFile) return input.show ? { action: "reject" as const } : { action: "skip" as const };
  return { action: "store" as const, show: input.show };
}
