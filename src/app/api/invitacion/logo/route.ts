import { loadInviteBrand } from "@/lib/organismo/invite-brand";
import { createSupabaseAnon } from "@/lib/supabase/auth-session";

export const instant = false;

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("t") ?? "";
  const brand = await loadInviteBrand(token);
  if (!brand?.logoPath) return new Response(null, { status: 404 });

  const file = await createSupabaseAnon().storage.from("organization-logos").download(brand.logoPath);
  if (file.error || !file.data) return new Response(null, { status: 404 });

  return new Response(file.data, {
    headers: {
      "Content-Type": file.data.type || "image/png",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
