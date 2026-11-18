import index from "@/content/methodology/v2/index.json";

export function instrumentLabel(id: string) {
  const group = index.groups.find((item) => item.id === id || item.instruments.includes(id));
  return group?.label ?? id;
}
