const bare = /^[^<>\s]+@[^<>\s]+$/;
const wrapped = /^(.*)<([^<>\s]+@[^<>\s]+)>$/;

export function mailFrom(value: string | undefined) {
  const raw = (value ?? "").trim().replace(/^["']|["']$/g, "").trim();
  if (bare.test(raw)) return raw;
  const match = wrapped.exec(raw);
  if (!match) return null;
  const name = match[1].trim().replace(/^["']|["']$/g, "").trim();
  const email = match[2];
  return name ? `${name} <${email}>` : email;
}
