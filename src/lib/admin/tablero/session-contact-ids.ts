import "server-only";

import type { adminDb } from "@/lib/admin/admin-db";
import { collectSessionContactIds } from "./session-contact-ids-collect";

type Db = NonNullable<Awaited<ReturnType<typeof adminDb>>>;

/** Contact ids tied to a session via RSVPs, company.session_id, or link_copies. */
export async function sessionContactIds(db: Db, sessionId: string) {
  const [companies, links, rsvps] = await Promise.all([
    db.from("companies").select("profile_id").eq("session_id", sessionId),
    db.from("link_copies").select("organization_id").eq("session_id", sessionId),
    db.from("session_rsvps").select("profile_id, email").eq("session_id", sessionId),
  ]);
  if (companies.error) throw new Error(companies.error.message);
  if (links.error) throw new Error(links.error.message);
  if (rsvps.error) throw new Error(rsvps.error.message);
  return collectSessionContactIds(db, {
    profileIds: [
      ...(companies.data ?? []).map((row) => row.profile_id),
      ...(rsvps.data ?? []).map((row) => row.profile_id),
    ],
    emails: (rsvps.data ?? []).map((row) => row.email),
    orgIds: (links.data ?? []).map((row) => row.organization_id),
  });
}