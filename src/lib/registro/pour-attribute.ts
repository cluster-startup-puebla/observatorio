import type { EmpresarioProfile } from "@/lib/onboarding/empresario-draft";

export async function attributeInviteAfterPour(
  token: string | null,
  email: string,
  profile: EmpresarioProfile,
) {
  if (!token) return;
  try {
    const { attributeSignup } = await import("@/lib/organismo/attribute-signup");
    await attributeSignup({
      token,
      email,
      sectorSlug: profile.sectorSlug,
      nombre: profile.fullName,
      empresa: profile.companyName,
    });
  } catch {
    // The profile is already saved; poured_at is still marked.
  }
}