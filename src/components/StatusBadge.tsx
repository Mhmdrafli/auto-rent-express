import { cn } from "@/lib/utils";
import type { CarStatus } from "@/types";

const map: Record<CarStatus, { label: string; cls: string }> = {
  ready: { label: "Ready", cls: "bg-success/15 text-success border-success/30" },
  rented: { label: "Disewa", cls: "bg-destructive/15 text-destructive border-destructive/30" },
  maintenance: { label: "Maintenance", cls: "bg-warning/20 text-warning-foreground border-warning/40" },
};

export function StatusBadge({ status, className }: { status: CarStatus; className?: string }) {
  const { label, cls } = map[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold", cls, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full",
        status === "ready" && "bg-success",
        status === "rented" && "bg-destructive animate-pulse",
        status === "maintenance" && "bg-warning")} />
      {label}
    </span>
  );
}
