import { accessQrDataUrl } from "@/lib/onboarding/access-qr";

export async function AccessPass({ code }: { code: string }) {
  const src = await accessQrDataUrl(code);

  return (
    <div className="grid justify-items-center gap-3 text-center">
      <p data-testid="qr-listo" className="text-base font-semibold text-ink">
        Tu pase quedó listo.
      </p>
      {/* Data URL from our own generator. next/image does not accept it. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        data-testid="qr-acceso"
        src={src}
        alt="QR de acceso"
        width={220}
        height={220}
        className="rounded-sm border border-line bg-white p-3"
      />
    </div>
  );
}
