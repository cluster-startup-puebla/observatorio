import { copyLinkChevronStyle, copyLinkControl } from "@/components/organismo/copy-link-controls";
import { inviteSector, sectors } from "@/lib/sectors";

export function CopyLinkSector({ sector }: { sector?: string }) {
  const selected = sector && inviteSector(sector) ? sector : "turismo";
  return (
    <label className="grid w-56 max-w-full gap-1 text-small text-ink-secondary">
      Sector
      <select
        name="sector"
        key={selected}
        defaultValue={selected}
        data-tour="sector"
        className={copyLinkControl}
        style={copyLinkChevronStyle}
      >
        {sectors.map((item) => (
          <option key={item.slug} value={item.slug}>
            {item.name}
          </option>
        ))}
      </select>
    </label>
  );
}
