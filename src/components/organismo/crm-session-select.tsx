"use client";

import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { controlClass, Field } from "@/components/landing/molecules/field";
import { crmHref } from "@/lib/organismo/crm-query";

export function CrmSessionSelect({
  sessions,
  selectedId,
  vista,
  estado,
}: {
  sessions: { id: string; label: string }[];
  selectedId: string | null;
  vista: "tabla" | "tarjetas";
  estado?: string;
}) {
  const router = useRouter();
  const value = selectedId ?? "todas";
  return (
    <div className="min-w-[18rem] max-w-md">
      <Field id="crm-sesion" label="Sesión">
        <div className="relative min-w-0">
          <select
            id="crm-sesion"
            className={`${controlClass} appearance-none pr-11`}
            value={value}
            onChange={(event) => {
              const next = event.target.value;
              router.push(crmHref({ vista, estado, sesion: next === "todas" ? "todas" : next }));
            }}
          >
            <option value="todas">Todas</option>
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.label}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden
            className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-muted"
          />
        </div>
      </Field>
    </div>
  );
}
