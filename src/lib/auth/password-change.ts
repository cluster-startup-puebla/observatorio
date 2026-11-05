export function freshPasswordError(next: string, confirm: string) {
  if (next.trim().length < 8) return "corta" as const;
  if (next !== confirm) return "distinta" as const;
  return null;
}

export function passwordChangeError(input: { current: string; next: string; confirm: string }) {
  if (input.current.trim().length < 8) return "actual" as const;
  const fresh = freshPasswordError(input.next, input.confirm);
  if (fresh) return fresh;
  if (input.next === input.current) return "igual" as const;
  return null;
}
