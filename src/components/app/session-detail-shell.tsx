import { MapPin } from "lucide-react";

export function SessionDetailShell({
  title,
  when,
  venue,
  status,
  children,
}: {
  title: string;
  when: string;
  venue: string;
  status?: string;
  children: React.ReactNode;
}) {
  return (
    <article className="grid w-full max-w-2xl gap-4 md:max-w-none">
      <header className="grid gap-2 border-b border-line pb-4">
        <p className="text-small font-semibold tracking-[0.08em] text-brand uppercase">Sesión</p>
        <h1 className="font-display text-[1.5rem] leading-[1.15] text-ink sm:text-[1.75rem]">{title}</h1>
        <div className="grid gap-0.5 text-body text-ink-secondary">
          <p className="text-ink">{when}</p>
          {venue ? (
            <p className="inline-flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
              <span>{venue}</span>
            </p>
          ) : null}
        </div>
        {status ? (
          <p className="w-fit rounded-full border border-line bg-surface px-3 py-1 text-small font-semibold text-ink">
            {status}
          </p>
        ) : null}
      </header>
      {children}
    </article>
  );
}
