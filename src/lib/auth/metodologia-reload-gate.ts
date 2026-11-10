import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { currentEventOpen } from "./current-event-open";
import { metodologiaReloadCookie, metodologiaReloadPlan } from "./metodologia-reload";

export async function prepareMetodologiaReload() {
  const eventOpen = await currentEventOpen();
  const cookie = eventOpen ? undefined : (await cookies()).get(metodologiaReloadCookie)?.value;
  const plan = metodologiaReloadPlan(eventOpen, cookie);
  if (plan.clearCookie) redirect("/metodologia/reload");
  return plan.showNotice;
}
