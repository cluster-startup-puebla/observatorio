"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { driveTour } from "@/components/organismo/tour/drive";
import { tourStart, tourSteps } from "@/lib/organismo/tour";
import { orgHref } from "@/lib/sessions/org-href";

function markSeen() {
  window.localStorage.setItem("org-tour-seen", "1");
}

export function OrgTour({
  slug,
  sessionSlug,
  sessions,
  crm,
  tour,
}: {
  slug: string;
  sessionSlug?: string;
  sessions: number;
  crm: boolean;
  tour: boolean;
}) {
  const router = useRouter();
  useEffect(() => {
    const seen = window.localStorage.getItem("org-tour-seen") === "1";
    const home = orgHref(slug, sessionSlug);
    const crmPath = `${home}/crm`;
    const path = crm ? crmPath : home;
    const phase = tourStart({ path, tour, seen });
    if (!phase) return;
    const steps = tourSteps(phase, sessions);
    if (phase === "home") {
      return driveTour({
        steps,
        onAdvance: () => {
          router.push(`${crmPath}?tour=1`);
        },
        onFinish: markSeen,
      });
    }
    return driveTour({ steps, onFinish: markSeen });
  }, [crm, router, sessionSlug, sessions, slug, tour]);

  return null;
}
