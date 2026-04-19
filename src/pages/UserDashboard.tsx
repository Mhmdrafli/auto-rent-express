import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, AlertTriangle, CheckCircle2, Clock, CreditCard } from "lucide-react";
import { bookingsApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EngineBadge } from "@/components/EngineBadge";
import { PaymentDialog } from "@/components/PaymentDialog";
import { useCountdown } from "@/hooks/useCountdown";
import { formatDateTime, formatIDR } from "@/lib/format";
import { toast } from "sonner";
import type { Booking } from "@/types";

export default function UserDashboard() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const payId = params.get("pay");
  const [payOpen, setPayOpen] = useState(!!payId);
  useEffect(() => setPayOpen(!!payId), [payId]);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["bookings", user.id],
    queryFn: () => bookingsApi.list(String(user.id)),
  });

  const active = bookings?.find((b) => b.status === "active");
  const target = payId && bookings?.find((b) => String(b.id) === payId);

  return (
    <div className="container space-y-8 py-8">
      <header>
        <h1 className="text-3xl font-bold">Dashboard Saya</h1>
        <p className="text-muted-foreground">Halo {user.name}, kelola sewa aktif & riwayat di sini.</p>
      </header>

      {active && <ActiveRentalCard booking={active} />}

      <section>
        <h2 className="mb-4 text-xl font-semibold">Riwayat Sewa</h2>
        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
        ) : !bookings?.length ? (
          <Card><CardContent className="py-10 text-center text-muted-foreground">Belum ada riwayat sewa.</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => <BookingRow key={b.id} booking={b} onPay={() => setParams({ pay: b.id })} />)}
          </div>
        )}
      </section>

      {target && <PaymentDialog booking={target} open={payOpen} onOpenChange={(v) => { setPayOpen(v); if (!v) setParams({}); }} />}
    </div>
  );
}

function ActiveRentalCard({ booking }: { booking: Booking }) {
  const qc = useQueryClient();
  const cd = useCountdown(booking.end_at);
  const ret = useMutation({
    mutationFn: () => bookingsApi.returnCar(booking.id, new Date().toISOString()),
    onSuccess: (b) => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["cars"] });
      toast.success(b.fine_amount > 0 ? `Mobil dikembalikan. Denda ${formatIDR(b.fine_amount)}` : "Mobil dikembalikan tepat waktu!");
    },
  });

  return (
    <Card className="overflow-hidden border-primary/30 bg-gradient-card shadow-elegant">
      <div className="grid gap-0 md:grid-cols-[260px_1fr]">
        <img src={booking.car?.image_url} alt="" className="h-full max-h-64 w-full object-cover" />
        <div className="space-y-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-primary">Sewa aktif</p>
              <h3 className="text-xl font-bold">{booking.car?.brand} {booking.car?.model}</h3>
            </div>
            {booking.car && <EngineBadge engine={booking.car.engine} />}
          </div>

          <div className={`rounded-xl border p-4 ${cd.overdue ? "border-destructive/40 bg-destructive/10" : "border-primary/20 bg-primary/5"}`}>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-sm font-medium">
                {cd.overdue
                  ? <><AlertTriangle className="h-4 w-4 text-destructive" /> Terlambat</>
                  : <><Clock className="h-4 w-4 text-primary" /> Sisa waktu</>}
              </span>
              <span className={`font-mono text-2xl font-bold tabular-nums ${cd.overdue ? "text-destructive" : "text-primary"}`}>{cd.label}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Wajib kembali: {formatDateTime(booking.end_at)}</p>
          </div>

          <Button onClick={() => ret.mutate()} disabled={ret.isPending} className="w-full sm:w-auto">
            <CheckCircle2 className="mr-1.5 h-4 w-4" />
            {ret.isPending ? "Memproses..." : "Kembalikan Mobil Sekarang"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function BookingRow({ booking, onPay }: { booking: Booking; onPay: () => void }) {
  const statusMap = {
    awaiting_payment: { label: "Menunggu Pembayaran", cls: "bg-warning/15 text-warning-foreground border-warning/40" },
    active: { label: "Aktif", cls: "bg-primary/10 text-primary border-primary/30" },
    returned: { label: "Selesai", cls: "bg-success/15 text-success border-success/30" },
    overdue: { label: "Terlambat", cls: "bg-destructive/15 text-destructive border-destructive/30" },
    cancelled: { label: "Dibatalkan", cls: "bg-muted text-muted-foreground border-border" },
  } as const;
  const s = statusMap[booking.status];

  return (
    <Card>
      <CardContent className="flex flex-col items-start gap-4 p-4 sm:flex-row sm:items-center">
        <img src={booking.car?.image_url} alt="" className="h-16 w-24 flex-shrink-0 rounded-lg object-cover" />
        <div className="flex-1">
          <p className="font-semibold">{booking.car?.brand} {booking.car?.model}</p>
          <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
            <CalendarClock className="h-3.5 w-3.5" />
            {formatDateTime(booking.start_at)} → {formatDateTime(booking.end_at)}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${s.cls}`}>{s.label}</span>
            {booking.fine_amount > 0 && (
              <span className="inline-flex items-center rounded-full border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                Denda: {formatIDR(booking.fine_amount)}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="font-bold">{formatIDR(booking.base_total + booking.fine_amount)}</p>
          {booking.status === "awaiting_payment" && (
            <Button size="sm" className="mt-2" onClick={onPay}>
              <CreditCard className="mr-1.5 h-4 w-4" />Bayar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
