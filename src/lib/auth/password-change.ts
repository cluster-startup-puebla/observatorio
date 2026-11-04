export function passwordChangeError(input: { current: string; next: string; confirm: string }) {
  if (input.current.trim().length < 8) return "actual" as const;
  if (input.next.trim().length < 8) return "corta" as const;
  if (input.next !== input.confirm) return "distinta" as const;
  if (input.next === input.current) return "igual" as const;
  return null;
}
