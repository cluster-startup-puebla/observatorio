"use server";

import { updateTag } from "next/cache";
import { readSessionAccount } from "@/lib/auth/session-account";
import { companyTag } from "@/lib/app/view-cache";

export async function refreshCompanyView() {
  const account = await readSessionAccount();
  if (!account) return;
  updateTag(companyTag(account.id));
}
