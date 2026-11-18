"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function DiagnosticosRefresh() {
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => router.refresh(), 60_000);
    return () => clearInterval(timer);
  }, [router]);

  return (
    <Button type="button" variant="outline" onClick={() => router.refresh()}>
      Recargar
    </Button>
  );
}
