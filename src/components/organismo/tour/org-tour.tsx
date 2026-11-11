"use client";

import { useEffect } from "react";
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
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination
          window.location.assign(`/${slug}/crm?tour=1`);
        },
        onFinish: markSeen,
      });
    }
    return driveTour({ steps, onFinish: markSeen });
  }, [crm, sessions, slug, tour]);

  return null;
}
