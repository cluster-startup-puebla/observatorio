export type PublicLogo = { name: string; src: string };

export type LogoCandidate = {
  name: string;
  showLogoOnEvent: boolean;
  purpose: string | null;
  objectPath: string | null;
};

export function logoIdentity(name: string) {
  return name.trim().toLocaleLowerCase("es-MX").replace(/\s+/g, " ");
}

type MarkedLogo = PublicLogo & { mark?: string };

export function uniquePublicLogos(logos: MarkedLogo[]) {
  const names = new Set<string>();
  const marks = new Set<string>();
  const unique: PublicLogo[] = [];
  for (const logo of logos) {
    const key = logoIdentity(logo.name);
    if (!key || names.has(key) || (logo.mark && marks.has(logo.mark))) continue;
    names.add(key);
    if (logo.mark) marks.add(logo.mark);
    unique.push({ name: logo.name, src: logo.src });
  }
  return unique;
}

export function publicLogos(rows: LogoCandidate[], srcFor: (objectPath: string) => string) {
  return uniquePublicLogos(
    rows.flatMap((row) => {
      if (!row.showLogoOnEvent || row.purpose !== "company_logo" || !row.objectPath) return [];
      return [{ name: row.name, src: srcFor(row.objectPath) }];
    }),
  );
}

export function eventLogoSrc(profileId: string) {
  return `/api/programa/logo/${profileId}`;
}

type EventLogoRow = { profile_id: string; legal_name: string | null; object_path: string | null };

export async function loadPublicLogos(): Promise<PublicLogo[]> {
  try {
    const { createSupabaseAnon } = await import("@/lib/supabase/auth-session");
    const db = createSupabaseAnon();
    const listed = await db.rpc("event_logos");
    if (listed.error) return [];
    const rows = ((listed.data ?? []) as EventLogoRow[]).flatMap((row) => {
      if (!row.object_path) return [];
      return [{ name: row.legal_name?.trim() || "Empresa", src: eventLogoSrc(row.profile_id), path: row.object_path }];
    });
    const { logoMarks } = await import("./logo-mark");
    const marks = await logoMarks(rows.map((row) => row.path), async (path) => {
      const file = await db.storage.from("company-logos").download(path);
      if (file.error || !file.data) return null;
      return Buffer.from(await file.data.arrayBuffer());
    });
    return uniquePublicLogos(rows.map((row, index) => ({ name: row.name, src: row.src, mark: marks[index] })));
  } catch {
    return [];
  }
}
