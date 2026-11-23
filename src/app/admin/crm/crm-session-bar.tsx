"use client";

import { SessionFilter } from "@/components/admin/session-filter";
import type { SessionChoice } from "@/lib/admin/tablero/session-choices";

export function CrmSessionBar({
  choices,
  sessionId,
  keep = {},
}: {
  choices: SessionChoice[];
  sessionId: string | null;
  keep?: Record<string, string>;
}) {
  return (
    <div className="mb-4">
      <SessionFilter
        action="/admin/crm"
        choices={choices}
        selectedId={sessionId}
        allowAll
        submitLabel="Ver CRM"
        testId="crm-sesion"
        keep={keep}
      />
    </div>
  );
}
