export function onProgramField(path: string) {
  return path === "/v2";
}

export function navLinkClass(current: boolean, onField: boolean) {
  if (onField) {
    return current
      ? "font-semibold text-white underline decoration-2 underline-offset-[0.4em]"
      : "text-white/90 hover:text-white";
  }
  return current
    ? "font-semibold text-ink underline decoration-brand decoration-2 underline-offset-[0.4em]"
    : "text-ink-secondary hover:text-ink";
}
