import type { ReactNode } from "react";
import { PanelCrumbs, type Crumb } from "@/components/admin/panel-crumbs";

export { homeCrumb, listCrumbs, parentLabel, trailCrumbs } from "@/components/admin/panel-crumbs";

export function PanelHeader({
  title,
  lead,
  crumbs,
  actions,
  testId,
}: {
  title: string;
  lead?: string;
  crumbs: Crumb[];
  actions?: ReactNode;
  testId?: string;
}) {
  return (
    <header className="mb-6 flex flex-col gap-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-h1 text-ink" data-testid={testId}>
            {title}
          </h1>
          {actions ? <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div> : null}
        </div>
        <PanelCrumbs crumbs={crumbs} />
      </div>
      {lead ? <p className="max-w-2xl text-body text-ink-secondary">{lead}</p> : null}
    </header>
  );
}
