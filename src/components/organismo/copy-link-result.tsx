import { CopyLinkButton } from "@/components/organismo/copy-link-button";
import { LinkReady } from "@/components/organismo/link-ready";

export function CopyLinkResult({ url, ready }: { url?: string; ready?: boolean }) {
  if (!url) {
    return <p className="text-small text-ink-muted">Elige el sector y genera el enlace para compartirlo.</p>;
  }
  return (
    <>
      {ready ? <LinkReady url={url} /> : null}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <p
          data-testid="enlace-evento"
          className="min-w-0 flex-1 break-all rounded-lg border border-line bg-surface-subtle px-3 py-2 font-mono text-small text-ink"
        >
          {url}
        </p>
        <CopyLinkButton url={url} />
      </div>
    </>
  );
}
