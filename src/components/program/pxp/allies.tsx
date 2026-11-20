import { ChevronDown } from "lucide-react";
import { AllyReel } from "./ally-reel";

export function PxpAllies() {
  return (
    <div id="aliados" className="relative z-10 pb-2">
      <AllyReel />
      <div className="flex justify-center gap-5 pb-3 text-white" aria-hidden>
        <ChevronDown className="pxp-drop" size={18} strokeWidth={1.75} />
        <ChevronDown className="pxp-drop" style={{ animationDelay: "0.16s" }} size={18} strokeWidth={1.75} />
        <ChevronDown className="pxp-drop" style={{ animationDelay: "0.32s" }} size={18} strokeWidth={1.75} />
      </div>
    </div>
  );
}
