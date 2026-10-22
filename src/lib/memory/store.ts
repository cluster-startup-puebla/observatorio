import type { CrmStatus } from "../crm-status";
import type { AccountRole } from "../directory";

export type Person = {
  id: string;
  email: string;
  role: AccountRole;
  onboarded: boolean;
  sectorSlug?: string;
  size?: string;
  name?: string;
  logoKey?: string;
  logo?: StoredLogo;
  orgSlug?: string;
  password?: string;
  orgId?: string;
  empresa?: string;
  jobTitle?: string;
  whatsapp?: string;
  marketSize?: string;
  municipality?: string;
  referralSource?: string;
  sessionInterest?: string;
  status: CrmStatus | null;
};

export type StoredLogo = { bytes: Uint8Array; contentType: string; objectPath: string };

export type StoredOrg = {
  id: string;
  name: string | null;
  brand_color: string | null;
  brand_completed_at: string | null;
  created_at: string;
  logo: StoredLogo | null;
};

export type MemoryStore = {
  seq: number;
  people: Person[];
  answers: Record<string, Record<string, string>>;
  copies: Record<string, number>;
  registrations: Record<string, number>;
  attributed: string[];
  outbox: { to: string; subject: string }[];
  organizations: StoredOrg[];
  opens: { orgId: string; sectorSlug: string; at: string }[];
};

const globalKey = "__observatorioDirectory";

export function emptyStore(): MemoryStore {
  return {
    seq: 0, people: [], answers: {}, copies: {}, registrations: {}, attributed: [],
    outbox: [], organizations: [], opens: [],
  };
}

export function memoryStore(): MemoryStore {
  const bag = globalThis as typeof globalThis & { [globalKey]?: MemoryStore };
  if (!bag[globalKey]) bag[globalKey] = emptyStore();
  return bag[globalKey];
}

export function resetDirectory() {
  (globalThis as typeof globalThis & { [globalKey]?: MemoryStore })[globalKey] = emptyStore();
}

export function bucket(orgId: string, sectorSlug: string) {
  return `${orgId}:${sectorSlug}`;
}

export function refSecret() {
  return process.env.REF_SECRET ?? "e2e-ref-secret";
}

