import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Users, Gauge, AlertCircle } from "lucide-react";
import { bookingsApi, carsApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { EngineBadge } from "@/components/EngineBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatIDR } from "@/lib/format";
import { toast } from "sonner";
import { EngineType } from "@/types";

export default function CarDetailPage() {
  const { id = "" } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: car, isLoading } = useQuery({ queryKey: ["car", id], queryFn: () => carsApi.get(id) });

  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(tomorrow);

  const days = Math.max(1, Math.ceil((+new Date(end) - +new Date(start)) / 86_400_000));
  const total = (car?.daily_price ?? 0) * days;

  const book = useMutation({
    mutationFn: () => bookingsApi.create({
      car_id: id,
      user_id: String(user.id),
      start_at: new Date(`${start}T10:00:00`).toISOString(),
      end_at: new Date(`${end}T10:00:00`).toISOString(),
    }),
    onSuccess: (b) => {
      qc.invalidateQueries({ queryKey: ["cars"] });
      qc.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Booking dibuat — silakan upload bukti pembayaran.");
      navigate(`/dashboard?pay=${b.id}`);
    },
  });

  if (isLoading || !car) {
    return <div className="container py-10"><Skeleton className="h-96 w-full rounded-2xl" /></div>;
  }

  return (
    <div className="container py-8">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link to="/"><ArrowLeft className="mr-1 h-4 w-4" />Kembali</Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl border bg-card shadow-card">
            <img src={car.image_url} alt={`${car.brand} ${car.model}`}
              className="aspect-[16/10] w-full object-cover" />
          </div>
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={car.status} />
              <EngineBadge engine={(car.type === 'electric' ? 'ev' : car.type) as EngineType} />
            </div>
            <h1 className="text-3xl font-bold">{car.brand} {car.model} <span className="font-normal text-muted-foreground">{car.year}</span></h1>
            <p className="text-muted-foreground">{car.description}</p>
            <div className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-3">
              <Spec icon={Users} label="Kapasitas" value={`${car.seats} kursi`} />
              <Spec icon={Gauge} label="Transmisi" value={car.transmission} />
              <Spec icon={Calendar} label="Plat" value={car.plate} />
            </div>
            <Alert className="border-warning/40 bg-warning/10">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Kebijakan denda keterlambatan:</strong> {car.fine_pct_per_hour}% × harga sewa harian per jam terlambat.
                ({formatIDR(Math.round(car.daily_price * car.fine_pct_per_hour / 100))} / jam)
              </AlertDescription>
            </Alert>
          </div>
        </div>

        <aside className="h-fit space-y-4 rounded-2xl border bg-gradient-card p-6 shadow-elegant lg:sticky lg:top-24">
          <div>
            <p className="text-sm text-muted-foreground">Harga sewa</p>
            <p className="text-3xl font-bold text-primary">{formatIDR(car.daily_price)}<span className="text-sm font-normal text-muted-foreground">/hari</span></p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="start">Mulai</Label>
              <Input id="start" type="date" value={start} min={today} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end">Selesai</Label>
              <Input id="end" type="date" value={end} min={start} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2.5 text-sm">
            <span className="text-muted-foreground">{days} hari × {formatIDR(car.daily_price)}</span>
            <span className="font-semibold">{formatIDR(total)}</span>
          </div>
          <Button
            className="w-full"
            size="lg"
            disabled={car.status !== "ready" || book.isPending}
            onClick={() => book.mutate()}
          >
            {car.status !== "ready" ? "Sedang Disewa" : book.isPending ? "Memproses..." : `Booking · ${formatIDR(total)}`}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Mobil otomatis terkunci untuk user lain setelah booking.
          </p>
        </aside>
      </div>
    </div>
  );
}

function Spec({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
