import { emptyEmpresarioValues, type EmpresarioValues } from "@/lib/onboarding/empresario-steps";

type Store = { getItem(key: string): string | null; setItem(key: string, value: string): void };

function keyFor(accountId: string) {
  return `empresario-draft:${accountId}`;
}

export function writeEmpresarioDraft(storage: Store, accountId: string, values: EmpresarioValues) {
  storage.setItem(keyFor(accountId), JSON.stringify({ ...values, hasLogo: false }));
}

export function readEmpresarioDraft(storage: Store, accountId: string, sectorSlug: string) {
  const raw = storage.getItem(keyFor(accountId));
  if (!raw) return emptyEmpresarioValues(sectorSlug);
  try {
    return { ...emptyEmpresarioValues(sectorSlug), ...JSON.parse(raw), hasLogo: false };
  } catch {
    return emptyEmpresarioValues(sectorSlug);
  }
}
