import { automotrizSource } from "@/content/automotriz-source";
import { extraReferralSources } from "@/content/extra-referral-sources";
import { clusterLogo, partners } from "@/content/landing";

export type ReferralSourceFilter = "all" | "cluster" | "org";

export type ReferralSource = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className: string;
};

const allSources: ReferralSource[] = [
  ...partners,
  automotrizSource,
  ...extraReferralSources,
  clusterLogo,
];

export function isClusterSource(alt: string) {
  return /cl[uú]ster/i.test(alt);
}

export function referralSources(filter: ReferralSourceFilter = "all"): ReferralSource[] {
  if (filter === "cluster") return allSources.filter((source) => isClusterSource(source.alt));
  if (filter === "org") return allSources.filter((source) => !isClusterSource(source.alt));
  return allSources;
}
