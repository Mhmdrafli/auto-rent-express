import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Download, Check, X, ShieldCheck } from "lucide-react";
import * as XLSX from "xlsx";
import { bookingsApi, carsApi, paymentsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EngineBadge } from "@/components/EngineBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDateTime, formatIDR } from "@/lib/format";
import { toast } from "sonner";
import type { Car, EngineType } from "@/types";

const empty: Omit<Car, "id"> = {
  brand: "", model: "", year: new Date().getFullYear(), plate: "",
  engine: "manual", seats: 5, transmission: "Manual",
  daily_price: 300_000, fine_pct_per_hour: 10, status: "ready",
  image_url: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80",
};

export default function AdminDashboard() {
  return (
    <div className="container space-y-6 py-8">
      <header className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-card">
          <ShieldCheck className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Kelola armada, pembayaran, dan denda.</p>
        </div>
      </header>

      <Tabs defaultValue="cars">
        <TabsList>
          <TabsTrigger value="cars">Mobil</TabsTrigger>
          <TabsTrigger value="payments">Validasi Pembayaran</TabsTrigger>
          <TabsTrigger value="returns">Pengembalian</TabsTrigger>
          <TabsTrigger value="fines">Denda & Laporan</TabsTrigger>
        </TabsList>
        <TabsContent value="cars" className="mt-4"><CarsAdmin /></TabsContent>
        <TabsContent value="payments" className="mt-4"><PaymentsAdmin /></TabsContent>
        <TabsContent value="returns" className="mt-4"><ReturnsAdmin /></TabsContent>
        <TabsContent value="fines" className="mt-4"><FinesAdmin /></TabsContent>
      </Tabs>
    </div>
  );
}

function CarsAdmin() {
  const qc = useQueryClient();
  const { data: cars } = useQuery({ queryKey: ["cars"], queryFn: carsApi.list });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Car | null>(null);
  const [form, setForm] = useState<Omit<Car, "id">>(empty);

  const save = useMutation({
    mutationFn: () => editing ? carsApi.update(editing.id, form) : carsApi.create(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cars"] }); toast.success("Mobil disimpan."); setOpen(false); },
  });
  const del = useMutation({
    mutationFn: (id: string) => carsApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cars"] }); toast.success("Mobil dihapus."); },
  });

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (c: Car) => { setEditing(c); const { id, ...rest } = c; setForm(rest); setOpen(true); };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Stok Mobil ({cars?.length ?? 0})</CardTitle>
        <Button onClick={openCreate}><Plus className="mr-1.5 h-4 w-4" />Tambah Mobil</Button>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Mobil</TableHead><TableHead>Tipe</TableHead><TableHead>Status</TableHead>
            <TableHead className="text-right">Harga/Hari</TableHead><TableHead>Denda %/jam</TableHead><TableHead></TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {cars?.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img src={c.image_url} alt="" className="h-10 w-14 rounded object-cover" />
                    <div>
                      <p className="font-medium">{c.brand} {c.model}</p>
                      <p className="text-xs text-muted-foreground">{c.plate} · {c.year}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell><EngineBadge engine={c.engine} /></TableCell>
                <TableCell><StatusBadge status={c.status} /></TableCell>
                <TableCell className="text-right font-medium">{formatIDR(c.daily_price)}</TableCell>
                <TableCell>{c.fine_pct_per_hour}%</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => del.mutate(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? "Edit Mobil" : "Tambah Mobil"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Brand"><Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} /></Field>
            <Field label="Model"><Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} /></Field>
            <Field label="Tahun"><Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: +e.target.value })} /></Field>
            <Field label="Plat"><Input value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value })} /></Field>
            <Field label="Tipe Mesin">
              <Select value={form.engine} onValueChange={(v) => setForm({ ...form, engine: v as EngineType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="ev">Listrik (EV)</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Transmisi"><Input value={form.transmission} onChange={(e) => setForm({ ...form, transmission: e.target.value })} /></Field>
            <Field label="Kursi"><Input type="number" value={form.seats} onChange={(e) => setForm({ ...form, seats: +e.target.value })} /></Field>
            <Field label="Harga / Hari (IDR)"><Input type="number" value={form.daily_price} onChange={(e) => setForm({ ...form, daily_price: +e.target.value })} /></Field>
            <Field label="Denda % / Jam"><Input type="number" value={form.fine_pct_per_hour} onChange={(e) => setForm({ ...form, fine_pct_per_hour: +e.target.value })} /></Field>
            <Field label="Status">
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Car["status"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="rented">Disewa</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="URL Gambar" className="sm:col-span-2">
              <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={() => save.mutate()} disabled={save.isPending}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function PaymentsAdmin() {
  const qc = useQueryClient();
  const { data: bookings } = useQuery({ queryKey: ["bookings"], queryFn: () => bookingsApi.list() });
  const decide = useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: "approved" | "rejected" }) => paymentsApi.decide(id, decision),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["bookings"] }); toast.success("Keputusan disimpan."); },
  });

  const pending = bookings?.filter((b) => b.payment?.status === "pending") ?? [];

  return (
    <Card>
      <CardHeader><CardTitle>Bukti Pembayaran Menunggu Validasi ({pending.length})</CardTitle></CardHeader>
      <CardContent>
        {pending.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">Tidak ada pembayaran yang menunggu.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {pending.map((b) => (
              <Card key={b.id}>
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{b.car?.brand} {b.car?.model}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(b.payment!.created_at)} · {b.payment!.method.toUpperCase()}</p>
                    </div>
                    <p className="font-bold">{formatIDR(b.payment!.amount)}</p>
                  </div>
                  {b.payment?.proof_url && (
                    <a href={b.payment.proof_url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg border">
                      <img src={b.payment.proof_url} alt="bukti" className="aspect-video w-full object-cover" />
                    </a>
                  )}
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" onClick={() => decide.mutate({ id: b.payment!.id, decision: "approved" })}>
                      <Check className="mr-1.5 h-4 w-4" />Setujui
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => decide.mutate({ id: b.payment!.id, decision: "rejected" })}>
                      <X className="mr-1.5 h-4 w-4" />Tolak
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ReturnsAdmin() {
  const qc = useQueryClient();
  const { data: bookings } = useQuery({ queryKey: ["bookings"], queryFn: () => bookingsApi.list() });
  const ret = useMutation({
    mutationFn: (id: string) => bookingsApi.returnCar(id, new Date().toISOString()),
    onSuccess: (b) => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["cars"] });
      toast.success(b.fine_amount > 0 ? `Dikembalikan, denda ${formatIDR(b.fine_amount)}` : "Dikembalikan tepat waktu");
    },
  });
  const active = bookings?.filter((b) => b.status === "active") ?? [];

  return (
    <Card>
      <CardHeader><CardTitle>Mobil Sedang Disewa ({active.length})</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow>
            <TableHead>Mobil</TableHead><TableHead>Mulai</TableHead><TableHead>Wajib Kembali</TableHead><TableHead></TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {active.map((b) => (
              <TableRow key={b.id}>
                <TableCell>{b.car?.brand} {b.car?.model}</TableCell>
                <TableCell className="text-sm">{formatDateTime(b.start_at)}</TableCell>
                <TableCell className="text-sm">{formatDateTime(b.end_at)}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" onClick={() => ret.mutate(b.id)}>
                    <Check className="mr-1.5 h-4 w-4" />Konfirmasi Pengembalian
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {active.length === 0 && (
              <TableRow><TableCell colSpan={4} className="py-8 text-center text-muted-foreground">Tidak ada mobil aktif.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function FinesAdmin() {
  const { data: bookings } = useQuery({ queryKey: ["bookings"], queryFn: () => bookingsApi.list() });
  const fined = bookings?.filter((b) => b.fine_amount > 0) ?? [];
  const totalFines = fined.reduce((s, b) => s + b.fine_amount, 0);

  const exportXlsx = () => {
    const rows = (bookings ?? []).map((b) => ({
      "ID Booking": b.id,
      "Mobil": `${b.car?.brand ?? ""} ${b.car?.model ?? ""}`,
      "Plat": b.car?.plate ?? "",
      "Mulai": formatDateTime(b.start_at),
      "Selesai (Rencana)": formatDateTime(b.end_at),
      "Dikembalikan": b.returned_at ? formatDateTime(b.returned_at) : "-",
      "Status": b.status,
      "Subtotal (IDR)": b.base_total,
      "Denda (IDR)": b.fine_amount,
      "Total (IDR)": b.base_total + b.fine_amount,
      "Metode Bayar": b.payment?.method ?? "-",
      "Status Bayar": b.payment?.status ?? "-",
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "Transaksi");
    const fineRows = fined.map((b) => ({
      "ID Booking": b.id,
      "Mobil": `${b.car?.brand} ${b.car?.model}`,
      "Wajib Kembali": formatDateTime(b.end_at),
      "Dikembalikan": b.returned_at ? formatDateTime(b.returned_at) : "-",
      "Denda (IDR)": b.fine_amount,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(fineRows), "Denda");
    XLSX.writeFile(wb, `laporan-rental-${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success("Laporan diunduh.");
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Transaksi" value={String(bookings?.length ?? 0)} />
        <StatCard label="Total Denda" value={formatIDR(totalFines)} />
        <StatCard label="Booking dengan Denda" value={String(fined.length)} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Daftar Denda</CardTitle>
          <Button onClick={exportXlsx}><Download className="mr-1.5 h-4 w-4" />Export Excel</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow>
              <TableHead>Mobil</TableHead><TableHead>Wajib Kembali</TableHead><TableHead>Dikembalikan</TableHead><TableHead className="text-right">Denda</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {fined.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>{b.car?.brand} {b.car?.model}</TableCell>
                  <TableCell className="text-sm">{formatDateTime(b.end_at)}</TableCell>
                  <TableCell className="text-sm">{b.returned_at ? formatDateTime(b.returned_at) : "-"}</TableCell>
                  <TableCell className="text-right font-semibold text-destructive">{formatIDR(b.fine_amount)}</TableCell>
                </TableRow>
              ))}
              {fined.length === 0 && <TableRow><TableCell colSpan={4} className="py-8 text-center text-muted-foreground">Belum ada denda.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="bg-gradient-card">
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold text-primary">{value}</p>
      </CardContent>
    </Card>
  );
}
