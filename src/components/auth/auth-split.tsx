import { AuthBack } from "@/components/auth/auth-back";
import { BandPhotos } from "@/components/auth/band-photos";

export function AuthSplit({
  title,
  lead,
  children,
}: {
  title: string;
  lead: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col px-4 py-4 sm:px-6 sm:py-6">
      <AuthBack />
      <div className="mt-4 grid flex-1 gap-4 lg:grid-cols-2">
        <section className="band-ink relative flex min-h-72 flex-col justify-between overflow-hidden rounded-3xl p-8 lg:min-h-full lg:p-12">
          <BandPhotos />
          <p className="relative z-10 font-display text-h3">Observatorio</p>
          <div className="relative z-10">
            <p className="text-h2 text-balance">{title}</p>
            <p className="band-ink-muted mt-4 max-w-sm text-body">{lead}</p>
          </div>
        </section>
        <section className="flex flex-col justify-center rounded-3xl border border-line bg-elevated p-8 shadow-[var(--card-shadow)] lg:p-12">
          {children}
        </section>
      </div>
    </div>
  );
}
