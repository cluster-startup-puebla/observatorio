export const steadyLife = {
  stale: 60 * 60 * 12,
  revalidate: 60 * 60 * 24,
  expire: 60 * 60 * 24 * 7,
};

export const sessionLife = {
  stale: 60 * 60,
  revalidate: 60 * 60 * 6,
  expire: 60 * 60 * 24,
};

export function companyTag(userId: string) {
  return `company-${userId}`;
}

export function sessionsTag(userId: string) {
  return `sessions-${userId}`;
}
