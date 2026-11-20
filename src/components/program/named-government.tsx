import { governmentMarks } from "@/components/landing/atoms/government-lockup";
import { ThemedLogo } from "@/components/landing/atoms/partner-mark";

export function NamedGovernment() {
  return (
    <ul className="grid grid-cols-2 gap-x-6 gap-y-8">
      {governmentMarks.map((logo) => (
        <li key={logo.src} className="flex flex-col items-center gap-2 text-center">
          <ThemedLogo
            src={logo.src}
            alt=""
            width={logo.width}
            height={logo.height}
            className="h-12 w-auto max-w-full object-contain"
          />
          <p className="text-small text-ink">{logo.alt}</p>
        </li>
      ))}
    </ul>
  );
}
