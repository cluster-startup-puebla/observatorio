import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { BroadcastKind } from "./broadcast-audience";
import { ensureConsentToken } from "./consent-link";
import { paintMail } from "./paint-mail";

type MailContext = { sessionLabel: string | null; continueHref: string | null };

export async function paintPending(
  db: SupabaseClient,
  row: { kind: BroadcastKind; profile_id: string | null },
  context: MailContext,
) {
  try {
    const acceptHref =
      row.kind === "open_innovation"
        ? await ensureConsentToken(db, row.profile_id ?? "", process.env.NEXT_PUBLIC_SITE_URL)
        : null;
    return await paintMail({
      kind: row.kind,
      profileId: row.profile_id,
      sessionLabel: context.sessionLabel,
      continueHref: context.continueHref,
      acceptHref,
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "sin cuerpo" };
  }
}
