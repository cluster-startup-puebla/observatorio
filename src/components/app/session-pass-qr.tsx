import { passQrDataUrl } from "@/lib/pass/qr-data-url";

export async function SessionPassQr({ rsvpId }: { rsvpId: string }) {
  const src = await passQrDataUrl(rsvpId);
  return (
    <section className="overflow-hidden rounded-[2rem] border border-line bg-elevated shadow-[0_16px_40px_-12px_rgb(22_40_79/0.18)]">
      <div className="grid gap-4 px-6 py-8 sm:px-8">
        <div className="grid gap-1">
          <p className="text-small font-semibold tracking-[0.08em] text-brand uppercase">Tu pase</p>
          <h2 className="font-display text-h3 text-ink">Listo para la mesa</h2>
          <p className="text-body text-ink-secondary">Muéstralo en el registro. También te llegó por correo.</p>
        </div>
        <figure className="grid w-fit justify-items-center gap-2 rounded-2xl border border-line bg-surface p-4">
          <img
            src={src}
            alt="QR de tu pase"
            width={280}
            height={280}
            className="rounded-lg bg-elevated"
          />
        </figure>
      </div>
    </section>
  );
}
