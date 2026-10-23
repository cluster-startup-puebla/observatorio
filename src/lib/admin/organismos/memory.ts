import { pageQuery } from "@/lib/admin/page-query";
import { memoryStore, type StoredOrg } from "@/lib/memory/store";
import { logoObjectPath } from "@/lib/storage-assets";
import { brandStamp } from "./brand";
import type { LogoBytes } from "./logo-file";

function orgs() {
  const state = memoryStore();
  if (!state.organizations) state.organizations = [];
  return state.organizations;
}

function row(org: StoredOrg) {
  return {
    id: org.id,
    logo: org.logo ? `/api/admin/organismos/${org.id}/logo` : "",
    name: org.name ?? "",
    brand_color: org.brand_color ?? "",
    brand_completed_at: org.brand_completed_at ? "Lista" : "Incompleta",
  };
}

export function memoryListOrganismos(rawPage: string | undefined) {
  const page = pageQuery(rawPage);
  const all = [...orgs()].sort((a, b) => b.created_at.localeCompare(a.created_at));
  return { page: page.page, rows: all.slice(page.from, page.to + 1).map(row) };
}

export function memoryLoadOrganismo(id: string) {
  const org = orgs().find((item) => item.id === id);
  if (!org) return null;
  return {
    org,
    members: [],
    contacts: [],
    copies: [],
    logo: org.logo ? { object_path: org.logo.objectPath, content_type: org.logo.contentType } : null,
    sectors: [] as { id: string; name: string | null }[],
    sessions: [] as { id: string; label: string }[],
  };
}

export function memoryReadLogo(id: string) {
  return orgs().find((item) => item.id === id)?.logo ?? null;
}

export function memoryCreateOrganismo(name: string, brandColor: string, logo: LogoBytes | null) {
  const state = memoryStore();
  state.seq += 1;
  const id = `org-${state.seq}`;
  const org: StoredOrg = {
    id,
    name,
    brand_color: brandColor,
    brand_completed_at: brandStamp({ name, brandColor, hasLogo: Boolean(logo) }),
    created_at: new Date().toISOString(),
    logo: logo ? { ...logo, objectPath: logoObjectPath(id, logo.contentType) } : null,
  };
  orgs().push(org);
  return id;
}

export function memoryUpdateOrganismo(id: string, name: string, brandColor: string, logo: LogoBytes | null) {
  const org = orgs().find((item) => item.id === id);
  if (!org) return false;
  org.name = name;
  org.brand_color = brandColor;
  if (logo) org.logo = { ...logo, objectPath: logoObjectPath(id, logo.contentType) };
  org.brand_completed_at = brandStamp({ name, brandColor, hasLogo: Boolean(org.logo) });
  return true;
}

export function memoryRemoveOrganismo(id: string) {
  const list = orgs();
  const index = list.findIndex((item) => item.id === id);
  if (index < 0) return false;
  list.splice(index, 1);
  return true;
}
