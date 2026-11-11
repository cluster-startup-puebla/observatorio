"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { driveTour } from "@/components/organismo/tour/drive";
import { tourStart, tourSteps } from "@/lib/organismo/tour";

function markSeen() {
  window.localStorage.setItem("org-tour-seen", "1");
}

export function OrgTour({
  slug,
  sessions,
  crm,
  tour,
}: {
  slug: string;
  sessions: number;
  crm: boolean;
  tour: boolean;
}) {
  const router = useRouter();
  useEffect(() => {
    const seen = window.localStorage.getItem("org-tour-seen") === "1";
    const path = crm ? `/${slug}/crm` : `/${slug}`;
    const phase = tourStart({ path, tour, seen });
    if (!phase) return;
    const steps = tourSteps(phase, sessions);
    if (phase === "home") {
      return driveTour({
        steps,
        onAdvance: () => {
          router.push(`/${slug}/crm?tour=1`);
        },
        onFinish: markSeen,
      });
    }
    return driveTour({ steps, onFinish: markSeen });
  }, [crm, router, sessions, slug, tour]);

  return null;
}
