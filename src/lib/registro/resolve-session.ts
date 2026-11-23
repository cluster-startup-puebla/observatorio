import { disruptorsSlug } from "@/content/disruptors";

const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function resolveRegistroSession(input: { queryId?: string | null }) {
  const id = input.queryId?.trim() ?? "";
  if (uuid.test(id)) return { kind: "id" as const, id };
  return { kind: "slug" as const, slug: disruptorsSlug };
}

export async function loadRegistroSessionId(input: {
  queryId?: string | null;
  lookup: (slug: string) => Promise<string | null>;
}) {
  const resolved = resolveRegistroSession(input);
  if (resolved.kind === "id") return resolved.id;
  return input.lookup(resolved.slug);
}
