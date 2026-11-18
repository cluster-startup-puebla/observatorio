import { AuthLogout } from "@/components/auth/auth-logout";
import { MetodologiaScreen } from "@/components/methodology/v2/screen";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { prepareMetodologiaReload } from "@/lib/auth/metodologia-reload-gate";
import { redirectUnfinishedEmpresario } from "@/lib/auth/onboarding-gate";
import { pickDraft } from "@/lib/methodology/v2/recover";
import { loadRun } from "./load-run";
import { MetodologiaReloadNotice } from "./reload-notice";

export const instant = false;

export default async function MetodologiaPage() {
  await redirectUnfinishedEmpresario();
  const showReloadNotice = await prepareMetodologiaReload();
  const loaded = await loadRun();
  const draft = pickDraft(null, loaded.draft);
  const blocked = loaded.choice.kind === "none" || loaded.packs.length === 0;

  return (
    <section className="container-site py-10 lg:py-14">
      {showReloadNotice ? <MetodologiaReloadNotice /> : null}
      <div className="grid max-w-3xl gap-6">
        <div className="flex items-center justify-end gap-3">
          <ThemeToggle />
          <AuthLogout />
        </div>
        {blocked ? (
          <p className="text-body text-ink">Este sector todavía no tiene diagnóstico</p>
        ) : (
          <MetodologiaScreen
            profileId={loaded.profileId}
            remote={draft}
            choice={loaded.choice}
            packs={loaded.packs}
          />
        )}
      </div>
    </section>
  );
}
