"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { listHref, listQueryQ } from "@/lib/admin/list-query";

export function ListSearch({
  basePath,
  q,
  placeholder = "Buscar por nombre…",
  extras,
}: {
  basePath: string;
  q?: string;
  placeholder?: string;
  extras?: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const initial = listQueryQ(q);
  const [value, setValue] = useState(initial);

  useEffect(() => setValue(initial), [initial]);

  const extrasKey = JSON.stringify(extras ?? {});

  useEffect(() => {
    const next = listQueryQ(value);
    if (next === initial) return;
    const timer = window.setTimeout(() => {
      router.replace(listHref({ basePath, q: next, page: 1, extras: JSON.parse(extrasKey) as typeof extras }));
    }, 300);
    return () => window.clearTimeout(timer);
  }, [basePath, extrasKey, initial, router, value]);


  return (
    <label className="grid max-w-sm gap-1.5 text-small font-medium text-ink">
      Buscar
      <Input
        type="search"
        value={value}
        placeholder={placeholder}
        aria-label="Buscar"
        data-testid="list-search"
        onChange={(event) => setValue(event.target.value)}
      />
    </label>
  );
}
