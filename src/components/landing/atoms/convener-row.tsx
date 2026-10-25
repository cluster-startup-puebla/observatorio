import { opticalLogoHeight, PartnerMark } from "@/components/landing/atoms/partner-mark";
import { conveners } from "@/content/conveners";

export function ConvenerRow() {
  return (
    <ul className="flex flex-wrap items-center gap-x-8 gap-y-6">
      {conveners.map((partner) => (
        <li key={partner.src}>
          <PartnerMark
            src={partner.src}
            alt={partner.alt}
            width={partner.width}
            height={partner.height}
            className="h-auto w-auto max-w-full object-contain"
            style={{ height: opticalLogoHeight(partner.width, partner.height) }}
          />
        </li>
      ))}
    </ul>
  );
}
