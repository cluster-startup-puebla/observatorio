import type { Directory } from "./directory";
import { accountMethods } from "./memory/accounts";
import { crmMethods } from "./memory/crm";
import { deskMethods } from "./memory/desk";
import { eventMethods } from "./memory/events";
import { onboardingMethods } from "./memory/onboarding";
import { ensureDeskSeed, seedCompletedAnswers } from "./memory/desk-seed";
import { memoryStore, resetDirectory } from "./memory/store";
import { createSupabaseDirectory } from "./supabase-directory";

export { resetDirectory, seedCompletedAnswers };

function createMemoryDirectory(): Directory {
  return {
    ...accountMethods(),
    ...onboardingMethods(),
    ...crmMethods(),
    ...eventMethods(),
    ...deskMethods(),
  };
}

export function ensureMesaSeed() {
  if (process.env.DIRECTORY !== "memory") return;
  ensureDeskSeed(memoryStore());
}

export function getDirectory(): Directory {
  const mode = process.env.DIRECTORY;
  if (!mode || mode === "memory") return createMemoryDirectory();
  if (mode === "supabase") {
    const { createSupabaseAdmin } = require("./supabase/server") as typeof import("./supabase/server");
    const admin = createSupabaseAdmin();
    if (!admin) throw new Error("Directory supabase no está listo");
    return createSupabaseDirectory(admin);
  }
  throw new Error(`Directory ${mode} todavía no está conectado`);
}
