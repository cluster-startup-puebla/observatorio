import { AuthLogout } from "@/components/auth/auth-logout";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { Disclaimer } from "@/components/methodology/v2/disclaimer";
import { ForgetDraft } from "@/components/methodology/v2/forget-draft";
import { MetodologiaScreen } from "@/components/methodology/v2/screen";
import { PendingVerificationAlert } from "@/components/methodology/pending-verification-alert";
import { prepareMetodologiaReload } from "@/lib/auth/metodologia-reload-gate";
import { redirectUnfinishedEmpresario } from "@/lib/auth/onboarding-gate";
import { readCompanyVerified } from "@/lib/auth/read-company-verified";
import { draftStarted, needsDisclaimer } from "@/lib/methodology/v2/disclaimer-gate";
import { pickDraft } from "@/lib/methodology/v2/recover";
import { loadRun } from "./load-run";
import { MetodologiaReloadNotice } from "./reload-notice";

export const instant = false;

export default async function MetodologiaPage() {
  await redirectUnfinishedEmpresario();
  const verified = await readCompanyVerified();
  const showReloadNotice = await prepareMetodologiaReload();
  const loaded = await loadRun();
  const draft = pickDraft(null, loaded.draft);
  const blocked = loaded.choice.kind === "none" || loaded.packs.length === 0;
  const showDisclaimer = needsDisclaimer({
    acceptedAt: loaded.disclaimerAcceptedAt,
    started: draftStarted(draft?.index ?? 0, Object.keys(draft?.answers ?? {}).length),
  });

  return (
    <section className={showDisclaimer ? "flex min-h-dvh flex-col overflow-x-clip bg-surface-subtle" : "overflow-x-clip"}>
      {showReloadNotice ? (
        <div className="container-site pt-6">
          <MetodologiaReloadNotice />
        </div>
      ) : null}
      <div className="container-site flex items-center justify-between gap-3 py-3">
        <p className="text-sm font-semibold tracking-wide text-ink">PueblaXPuebla</p>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <AuthLogout />
        </div>
      </div>
      {!verified ? (
        <div className="container-site py-10">
          <PendingVerificationAlert />
        </div>
      ) : showDisclaimer ? (
        <div className="container-site flex w-full flex-1 flex-col justify-center py-4 pb-10">
          <ForgetDraft profileId={loaded.profileId} />
          <Disclaimer />
        </div>
      ) : blocked ? (
        <p className="container-site pb-10 text-body text-ink">Este sector todavía no tiene diagnóstico</p>
      ) : (
        <MetodologiaScreen
          profileId={loaded.profileId}
          brought={loaded.brought}
          remote={draft}
          choice={loaded.choice}
          packs={loaded.packs}
        />
      )}
    </section>
  );
}
