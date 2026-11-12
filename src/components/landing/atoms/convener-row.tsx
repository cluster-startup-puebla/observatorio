import type { CSSProperties } from "react";
import { opticalLogoHeight, PartnerMark } from "@/components/landing/atoms/partner-mark";
import { conveners } from "@/content/conveners";

export function ConvenerRow() {
  return (
    <ul className="grid grid-cols-3 items-center justify-items-center gap-x-3 gap-y-4 lg:grid-cols-9 lg:gap-x-4 lg:gap-y-5">
      {conveners.map((partner) => (
        <li key={partner.src} className="flex min-w-0 items-center justify-center">
          <PartnerMark
            src={partner.src}
            alt={partner.alt}
            width={partner.width}
            height={partner.height}
            plateClassName="w-full justify-center"
            className="h-auto! max-h-(--mark-m) w-auto max-w-full object-contain sm:h-(--mark-h)! sm:max-h-none sm:w-auto"
            style={
              {
                "--mark-m": `${opticalLogoHeight(partner.width, partner.height, 22)}px`,
                "--mark-h": `${opticalLogoHeight(partner.width, partner.height, 32)}px`,
              } as CSSProperties
            }
          />
        </li>
      ))}
    </ul>
  );
}
