"use client";

import { useState } from "react";

function initials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "—";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
}

export function CompanyMark({ id, name }: { id: string; name: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="flex h-16 w-32 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-elevated">
      {failed ? (
        <span className="text-lg font-semibold text-ink">{initials(name)}</span>
      ) : (
        <img
          src={`/api/admin/empresas/${id}/logo`}
          alt={name}
          className="h-full w-full object-contain"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
