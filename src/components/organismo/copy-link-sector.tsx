"use client";

import { useState } from "react";
import { IndustryCombobox } from "@/components/industria/industry-combobox";
import { inviteSector } from "@/lib/sectors";

export function CopyLinkSector({ sector }: { sector?: string }) {
  const initial = sector && inviteSector(sector) ? sector : "turismo";
  const [value, setValue] = useState(initial);
  return (
    <div className="min-w-[16rem] max-w-full flex-1">
      <IndustryCombobox
        id="org-sector"
        name="sector"
        label="Sector"
        value={value}
        allowCustom={false}
        placeholder="Escribe o elige"
        onChange={setValue}
      />
    </div>
  );
}
