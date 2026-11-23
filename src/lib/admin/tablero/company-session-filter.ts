type SessionFlag = { id: string; is_current?: boolean | null };

/** Always strict: only companies tied to this session. */
export function companySessionOrFilter(_session: SessionFlag) {
  return null;
}

export function companySessionEq(sessionId: string) {
  return sessionId;
}
