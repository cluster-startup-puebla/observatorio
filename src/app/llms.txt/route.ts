import { connection } from "next/server";
import { listPublicSessions } from "@/lib/sessions/load-public";
import { llmsText } from "@/lib/site/llms-text";

export async function GET() {
  await connection();
  const sessions = await listPublicSessions().catch(() => []);
  return new Response(llmsText({ sessions }), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
