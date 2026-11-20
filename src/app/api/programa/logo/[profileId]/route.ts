import { createSupabaseAnon } from "@/lib/supabase/auth-session";

export const instant = false;

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_request: Request, context: { params: Promise<{ profileId: string }> }) {
  const { profileId } = await context.params;
  if (!uuid.test(profileId)) return new Response(null, { status: 404 });
  const db = createSupabaseAnon();
  const path = await db.rpc("event_logo_path", { target: profileId });
  if (path.error || typeof path.data !== "string" || !path.data) {
    return new Response(null, { status: 404 });
  }
  const file = await db.storage.from("company-logos").download(path.data);
  if (file.error || !file.data) return new Response(null, { status: 404 });
  return new Response(file.data, {
    headers: {
      "Content-Type": file.data.type || "image/png",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
