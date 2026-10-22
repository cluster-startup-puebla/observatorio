import { getDirectory } from "@/lib/memory-directory";
import { sectors } from "@/lib/sectors";
import { linkStats } from "./link-stats";

export async function loadOrgHome(orgId: string) {
  const directory = getDirectory();
  const opens = await directory.opensFor(orgId);
  let conversions = 0;
  for (const sector of sectors) {
    const c = await directory.conversion(orgId, sector.slug);
    conversions += c.registrations;
  }
  return linkStats({ opens, conversions, now: new Date() });
}
