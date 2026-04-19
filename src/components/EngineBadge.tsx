import { Settings, Zap, Leaf } from "lucide-react";
import type { EngineType } from "@/types";
import { cn } from "@/lib/utils";

const map = {
  manual:  { icon: Settings, label: "Manual", cls: "bg-engine-manual/10 text-engine-manual border-engine-manual/30" },
  ev:      { icon: Zap,      label: "Listrik (EV)", cls: "bg-engine-ev/10 text-engine-ev border-engine-ev/30" },
  hybrid:  { icon: Leaf,     label: "Hybrid", cls: "bg-engine-hybrid/10 text-engine-hybrid border-engine-hybrid/30" },
} as const;

export function EngineBadge({ engine, className }: { engine: EngineType; className?: string }) {
  const { icon: Icon, label, cls } = map[engine];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium", cls, className)}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
