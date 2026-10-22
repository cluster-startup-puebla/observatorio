export type ComboboxOption = { value: string; label: string };

export function customComboboxLabel(query: string, options: ComboboxOption[], allowCustom: boolean) {
  const text = query.trim();
  if (!allowCustom || text.length < 2) return "";
  const exact = options.some((option) => option.label.toLowerCase() === text.toLowerCase());
  return exact ? "" : text;
}

export function matchCombobox(
  text: string,
  options: ComboboxOption[],
  allowCustom: boolean,
  filtered: ComboboxOption[],
) {
  const next = text.trim();
  const exact = options.find(
    (option) =>
      option.label.toLowerCase() === next.toLowerCase() || option.value.toLowerCase() === next.toLowerCase(),
  );
  if (exact) return exact.value;
  if (allowCustom && next.length >= 2) return next;
  if (!allowCustom && filtered.length === 1) return filtered[0].value;
  return null;
}
