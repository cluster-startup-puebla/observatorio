type SessionFlag = { id: string; is_current?: boolean | null };

/** Current session keeps legacy rows without session_id; other sessions are strict. */
export function companySessionOrFilter(session: SessionFlag) {
  if (session.is_current) return `session_id.eq.${session.id},session_id.is.null`;
  return null;
}
