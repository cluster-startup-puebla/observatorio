import type { CSSProperties } from "react";
import { opticalLogoHeight, PartnerMark } from "@/components/landing/atoms/partner-mark";
import { conveners } from "@/content/conveners";

export function ConvenerRow() {
  return (
    <ul className="grid grid-cols-3 items-center gap-x-3 gap-y-6 sm:flex sm:flex-wrap sm:gap-x-8 sm:gap-y-6">
      {conveners.map((partner) => (
        <li key={partner.src} className="flex items-center justify-center sm:block">
          <PartnerMark
            src={partner.src}
            alt={partner.alt}
            width={partner.width}
            height={partner.height}
            plateClassName="w-full justify-center sm:w-auto"
            className="h-auto! max-h-(--mark-m) w-auto max-w-full object-contain sm:h-(--mark-h)! sm:max-h-none sm:w-auto"
            style={
              {
                "--mark-m": `${opticalLogoHeight(partner.width, partner.height, 30)}px`,
                "--mark-h": `${opticalLogoHeight(partner.width, partner.height)}px`,
              } as CSSProperties
            }
          />
        </li>
      ))}
    </ul>
  );
}
