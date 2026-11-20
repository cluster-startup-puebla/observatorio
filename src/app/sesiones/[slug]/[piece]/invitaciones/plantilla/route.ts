import { inviteTemplateCsv } from "@/lib/invite-sheet";

export function GET() {
  return new Response(inviteTemplateCsv(), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="plantilla-invitaciones.csv"',
    },
  });
}
