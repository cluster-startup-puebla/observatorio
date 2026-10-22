export async function saveWithRetry(
  save: (input: { personId: string; questionId: string; value: string }) => Promise<void>,
  input: { personId: string; questionId: string; value: string },
) {
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      await save(input);
      return { ok: true as const, attempts: attempt };
    } catch {
      if (attempt === 2) return { ok: false as const, attempts: 2 };
    }
  }
  return { ok: false as const, attempts: 2 };
}
