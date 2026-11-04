import "server-only";
import { sendOwnMail } from "@/lib/mail/send-own";
import { externalPassPending } from "./external-pass-state";
import { linkPassPending } from "./link-pass-state";
import { storePass } from "./store-pass";

export async function issueConfirmedPass(accessToken: string, profileId: string, email: string) {
  try {
    const pendingLink = await linkPassPending(accessToken, email);
    const pendingExternal = await externalPassPending(accessToken, profileId);
    if (pendingLink || pendingExternal) return;
    const stored = await storePass(accessToken, profileId);
    if (stored.ok) await sendOwnMail(accessToken, "event_pass");
  } catch (error) {
    console.error("issueConfirmedPass", error);
  }
}
