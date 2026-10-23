import { sanitizeSectorBody } from "@/lib/html/sanitize-sector-body";

export function SectorPageMessage({ headline, body }: { headline: string; body: string }) {
  const title = headline.trim();
  const safe = sanitizeSectorBody(body);
  if (!title && !safe) return null;
  return (
    <div data-testid="mensaje-pagina" className="grid max-w-2xl gap-3">
      {title ? <p className="font-semibold text-ink">{title}</p> : null}
      {safe ? <SectorBodyHtml html={safe} /> : null}
    </div>
  );
}

export function SectorBodyPreview({ body }: { body: string }) {
  const safe = sanitizeSectorBody(body);
  if (!safe) return <p className="whitespace-pre-wrap">Sin cuerpo. Edítalo desde la lista.</p>;
  return <SectorBodyHtml html={safe} />;
}

function SectorBodyHtml({ html }: { html: string }) {
  return (
    <div
      className="whitespace-pre-wrap [&_a]:underline [&_img]:my-2 [&_img]:h-auto [&_img]:max-w-full"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
