import { useEffect, useState } from "react";
import { differenceInSeconds, intervalToDuration } from "date-fns";

export function useCountdown(targetIso?: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!targetIso) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [targetIso]);

  if (!targetIso) return { label: "—", overdue: false, totalSeconds: 0 };
  const target = new Date(targetIso).getTime();
  const diff = differenceInSeconds(target, now);
  const overdue = diff < 0;
  const dur = intervalToDuration({ start: 0, end: Math.abs(diff) * 1000 });
  const parts = [
    dur.days ? `${dur.days}h` : null,
    `${String(dur.hours ?? 0).padStart(2, "0")}j`,
    `${String(dur.minutes ?? 0).padStart(2, "0")}m`,
    `${String(dur.seconds ?? 0).padStart(2, "0")}d`,
  ].filter(Boolean).join(" ");
  return { label: parts, overdue, totalSeconds: diff };
}
