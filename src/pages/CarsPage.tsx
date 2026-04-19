import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, ArrowRight } from "lucide-react";
import heroCar from "@/assets/hero-car.jpg";
import { carsApi } from "@/lib/api";
import { CarCard } from "@/components/CarCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import type { EngineType } from "@/types";

type Filter = "all" | EngineType;

export default function CarsPage() {
  const { data: cars, isLoading } = useQuery({ queryKey: ["cars"], queryFn: carsApi.list });
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [readyOnly, setReadyOnly] = useState(false);

  const filtered = useMemo(() => {
    return (cars ?? []).filter((c) => {
      if (filter !== "all" && c.engine !== filter) return false;
      if (readyOnly && c.status !== "ready") return false;
      if (q && !`${c.brand} ${c.model} ${c.plate}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [cars, q, filter, readyOnly]);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-hero text-primary-foreground">
        <div className="container grid gap-10 py-16 md:grid-cols-2 md:py-24">
          <div className="flex flex-col justify-center gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-success" /> Armada modern · Manual · EV · Hybrid
            </span>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
              Sewa mobil dengan tenang.<br />
              <span className="text-primary-glow">Transparan dan modern.</span>
            </h1>
            <p className="max-w-md text-base text-primary-foreground/80">
              Booking instan, status armada real-time, denda dihitung otomatis per jam.
              Bayar via Transfer Bank atau QRIS dengan upload bukti.
            </p>
            <div className="flex gap-3">
              <Button size="lg" variant="secondary" onClick={() => document.getElementById("cars")?.scrollIntoView({ behavior: "smooth" })}>
                Cari Mobil <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="absolute inset-0 rounded-3xl bg-primary-glow/20 blur-3xl" />
            <img src={heroCar} alt="Mobil rental premium" width={1600} height={900}
              className="relative w-full rounded-3xl object-cover shadow-elegant" />
          </div>
        </div>
      </section>

      {/* CATALOG */}
      <section id="cars" className="container py-12">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Daftar Mobil</h2>
            <p className="text-sm text-muted-foreground">Pilih sesuai kebutuhanmu — tipe mesin & ketersediaan ditandai jelas.</p>
          </div>
          <div className="flex flex-1 flex-col gap-3 md:max-w-xl md:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari brand, model, plat..." className="pl-9" />
            </div>
            <Button variant={readyOnly ? "default" : "outline"} onClick={() => setReadyOnly((v) => !v)}>
              Hanya Ready
            </Button>
          </div>
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">Semua</TabsTrigger>
            <TabsTrigger value="manual">Manual</TabsTrigger>
            <TabsTrigger value="ev">Listrik (EV)</TabsTrigger>
            <TabsTrigger value="hybrid">Hybrid</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <p className="rounded-xl border bg-card p-10 text-center text-muted-foreground">Tidak ada mobil yang cocok dengan filter.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => <CarCard key={c.id} car={c} />)}
          </div>
        )}
      </section>
    </>
  );
}
