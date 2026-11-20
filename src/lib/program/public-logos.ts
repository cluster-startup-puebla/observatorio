export type PublicLogo = { name: string; src: string };

export type LogoCandidate = {
  name: string;
  showLogoOnEvent: boolean;
  purpose: string | null;
  objectPath: string | null;
};

export function publicLogos(rows: LogoCandidate[], srcFor: (objectPath: string) => string) {
  return rows.flatMap((row) => {
    if (!row.showLogoOnEvent || row.purpose !== "company_logo" || !row.objectPath) return [];
    return [{ name: row.name, src: srcFor(row.objectPath) }];
  });
}

export function eventLogoSrc(profileId: string) {
  return `/api/programa/logo/${profileId}`;
}

type EventLogoRow = { profile_id: string; legal_name: string | null; object_path: string | null };

export async function loadPublicLogos(): Promise<PublicLogo[]> {
  try {
    const { createSupabaseAnon } = await import("@/lib/supabase/auth-session");
    const listed = await createSupabaseAnon().rpc("event_logos");
    if (listed.error) return [];
    return ((listed.data ?? []) as EventLogoRow[]).flatMap((row) => {
      if (!row.object_path) return [];
      return [{ name: row.legal_name?.trim() || "Empresa", src: eventLogoSrc(row.profile_id) }];
    });
  } catch {
    return [];
  }
}
