import { opticalLogoHeight, PartnerMark } from "@/components/landing/atoms/partner-mark";

export function PartnerRow({
  partners,
  layout = "fit",
}: {
  partners: {
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
  }[];
  layout?: "fit" | "natural";
}) {
  if (layout === "natural") {
    return (
      <ul className="flex w-full flex-wrap items-center justify-between gap-y-6 xl:flex-nowrap">
        {partners.map((partner) => (
          <li key={partner.src} className="min-w-0">
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

  return (
    <ul className="flex w-full flex-nowrap items-center gap-2">
      {partners.map((partner) => (
        <li key={partner.src} className="min-w-0 flex-1">
          <PartnerMark
            src={partner.src}
            alt={partner.alt}
            width={partner.width}
            height={partner.height}
            plateClassName="w-full justify-center"
            className="h-10 w-full object-contain sm:h-12"
          />
        </li>
      ))}
    </ul>
  );
}
