"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Scanner, type IDetectedBarcode } from "@yudiel/react-qr-scanner";
import { scanMesaAction } from "@/lib/admin/mesa/scan-action";

export function MesaQrScanner({ hold, paused = false }: { hold: string; paused?: boolean }) {
  const last = useRef(hold);
  const [ready, setReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [, startTransition] = useTransition();

  useEffect(() => setReady(true), []);
  useEffect(() => {
    if (paused) last.current = hold;
  }, [paused, hold]);

  function onScan(codes: IDetectedBarcode[]) {
    const value = codes[0]?.rawValue?.trim() ?? "";
    if (!value || value === last.current || paused) return;
    last.current = value;
    startTransition(() => {
      void scanMesaAction(value);
    });
  }

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden">
      <div className="grid w-full max-w-[min(100%,calc(100dvh-20rem))] gap-3">
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-line bg-black">
          {ready ? (
            <Scanner
              onScan={onScan}
              onError={() => setCameraError("No se pudo abrir la cámara.")}
              paused={paused}
              constraints={{ facingMode: "environment" }}
              formats={["qr_code"]}
              components={{ finder: false, torch: false, onOff: false, zoom: false }}
              scanDelay={800}
              sound={false}
              styles={{
                container: { width: "100%", height: "100%", aspectRatio: "1 / 1" },
                video: { width: "100%", height: "100%", objectFit: "contain" },
              }}
            />
          ) : null}
        </div>
        {cameraError ? <p className="text-center text-small text-mark">{cameraError}</p> : null}
      </div>
    </div>
  );
}
