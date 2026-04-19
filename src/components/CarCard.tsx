import { Link } from "react-router-dom";
import { Users, Gauge, ArrowRight } from "lucide-react";
import type { Car } from "@/types";
import { EngineBadge } from "./EngineBadge";
import { StatusBadge } from "./StatusBadge";
import { Button } from "@/components/ui/button";
import { formatIDR } from "@/lib/format";

export function CarCard({ car }: { car: any }) { // Sementara pakai any jika interface belum diupdate
  return (
    <article className="group overflow-hidden rounded-2xl border bg-card shadow-card transition-smooth hover:-translate-y-1 hover:shadow-elegant">
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
      <img
        src={car.image_url || `https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600`} 
        alt={car.name}
        loading="lazy"
        className="h-full w-full object-cover transition-smooth group-hover:scale-105"
      />
        <div className="absolute left-3 top-3"><StatusBadge status={car.status} /></div>
        {/* Ganti car.engine menjadi car.type */}
        <div className="absolute right-3 top-3"><EngineBadge engine={car.type} /></div>
      </div>
      
      <div className="space-y-3 p-5">
        <div>
          {/* Ganti car.brand & car.model menjadi car.name */}
          <h3 className="text-lg font-semibold leading-tight">{car.name}</h3>
          {/* Sesuaikan kolom tambahan jika belum ada di database, gunakan default value */}
          <p className="text-sm text-muted-foreground">ID: {car.id} · {car.status === 'ready' ? 'Tersedia' : 'Disewa'}</p>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {/* Gunakan nilai default jika kolom belum dibuat di migration */}
          <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4" />{car.seats || 4} kursi</span>
          <span className="inline-flex items-center gap-1.5"><Gauge className="h-4 w-4" />{car.transmission || "Otomatis"}</span>
        </div>

        <div className="flex items-end justify-between pt-2">
          <div>
            <p className="text-xs text-muted-foreground">Mulai dari</p>
            <p className="text-xl font-bold text-primary">
              {formatIDR(car.daily_price)}
              <span className="text-xs font-normal text-muted-foreground">/hari</span>
            </p>
          </div>
          <Button asChild size="sm" disabled={car.status !== "ready"}>
            <Link to={`/cars/${car.id}`}>
              Detail <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
