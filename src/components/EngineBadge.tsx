import { Settings, Zap, Leaf } from "lucide-react";
import type { EngineType } from "@/types";
import { cn } from "@/lib/utils";

const map = {
  manual:  { icon: Settings, label: "Manual", cls: "bg-engine-manual/10 text-engine-manual border-engine-manual/30" },
  ev:      { icon: Zap,      label: "Listrik (EV)", cls: "bg-engine-ev/10 text-engine-ev border-engine-ev/30" },
  electric: { icon: Zap,      label: "Listrik (EV)", cls: "bg-engine-ev/10 text-engine-ev border-engine-ev/30" },
  hybrid:  { icon: Leaf,     label: "Hybrid", cls: "bg-engine-hybrid/10 text-engine-hybrid border-engine-hybrid/30" },
} as const;

export function EngineBadge({ engine }: { engine: string }) {
  const config = map[engine as keyof typeof map];
  
  if (!config) return null; // Jika tipe aneh, jangan tampilkan apa-apa (daripada crash)

  const { icon: Icon, label } = config;
  return (
    <div className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      <span>{label}</span>
    </div>
  );
}
