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
    <header className="mb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-h1 text-ink" data-testid={testId}>
            {title}
          </h1>
          {lead ? <p className="mt-2 max-w-2xl text-body text-ink-secondary">{lead}</p> : null}
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <PanelCrumbs crumbs={crumbs} />
          {actions ? <div className="flex flex-wrap items-center justify-end gap-2">{actions}</div> : null}
        </div>
      </div>
    </header>
  );
}
