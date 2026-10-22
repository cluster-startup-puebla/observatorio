export function currentFlip(
  rows: { id: string; isCurrent: boolean }[],
  id: string,
  wantCurrent: boolean,
) {
  if (!wantCurrent) return { clearIds: [] as string[], setId: id, isCurrent: false };
  return {
    clearIds: rows.filter((row) => row.isCurrent && row.id !== id).map((row) => row.id),
    setId: id,
    isCurrent: true,
  };
}

export function attendeesFor<T>(isCurrent: boolean, rows: T[]) {
  return isCurrent ? rows : [];
}

export function topicDraft(input: { title: string; position: number }) {
  const title = input.title.trim();
  if (!title) return { ok: false as const, reason: "falta el título" };
  if (!Number.isInteger(input.position) || input.position < 1) {
    return { ok: false as const, reason: "posición inválida" };
  }
  return { ok: true as const, title, position: input.position };
}
