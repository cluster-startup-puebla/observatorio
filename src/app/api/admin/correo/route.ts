import { adminDb } from "@/lib/admin/admin-db";
import { innovationRecipients } from "@/lib/admin/correo/audience";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  await requireSuperadmin();
  const db = await adminDb();
  if (!db) return NextResponse.redirect(new URL("/admin/correo?error=sin%20sesi%C3%B3n", request.url));
  const profiles = await db.from("profiles").select("id, email, onboarded_at");
  if (profiles.error) {
    return NextResponse.redirect(new URL(`/admin/correo?error=${encodeURIComponent(profiles.error.message)}`, request.url));
  }
  const mails = innovationRecipients(profiles.data ?? []);
  const byEmail = new Map((profiles.data ?? []).map((row) => [row.email, row.id]));
  if (mails.length) {
    const inserted = await db.from("outbox_messages").insert(
      mails.map((mail) => ({
        kind: mail.kind,
        to_email: mail.to_email,
        subject: mail.subject,
        profile_id: byEmail.get(mail.to_email) ?? null,
      })),
    );
    if (inserted.error) {
      return NextResponse.redirect(new URL(`/admin/correo?error=${encodeURIComponent(inserted.error.message)}`, request.url));
    }
  }
  return NextResponse.redirect(new URL("/admin/correo?enviado=1", request.url));
}
