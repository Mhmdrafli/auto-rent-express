import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, QrCode, Upload } from "lucide-react";
import { paymentsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatIDR } from "@/lib/format";
import { toast } from "sonner";
import type { Booking, PaymentMethod } from "@/types";

export function PaymentDialog({ booking, open, onOpenChange }: {
  booking: Booking; open: boolean; onOpenChange: (v: boolean) => void;
}) {
  const qc = useQueryClient();
  const [method, setMethod] = useState<PaymentMethod>("transfer");
  const [proof, setProof] = useState<File | null>(null);

  const upload = useMutation({
    mutationFn: () => paymentsApi.upload({
      booking_id: booking.id, method, amount: booking.base_total, proof,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Bukti pembayaran terkirim. Menunggu validasi admin.");
      onOpenChange(false);
      setProof(null);
    },
    onError: () => toast.error("Gagal upload, coba lagi."),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Pembayaran</DialogTitle>
          <DialogDescription>
            Total tagihan <strong className="text-foreground">{formatIDR(booking.base_total)}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <RadioGroup value={method} onValueChange={(v) => setMethod(v as PaymentMethod)} className="grid grid-cols-2 gap-3">
            <Label htmlFor="m-transfer" className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 hover:bg-muted has-[:checked]:border-primary has-[:checked]:bg-primary/5">
              <RadioGroupItem value="transfer" id="m-transfer" />
              <Building2 className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Transfer Bank</p>
                <p className="text-xs text-muted-foreground">BCA · 1234567890</p>
              </div>
            </Label>
            <Label htmlFor="m-qris" className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 hover:bg-muted has-[:checked]:border-primary has-[:checked]:bg-primary/5">
              <RadioGroupItem value="qris" id="m-qris" />
              <QrCode className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">QRIS</p>
                <p className="text-xs text-muted-foreground">Semua e-wallet</p>
              </div>
            </Label>
          </RadioGroup>

          {method === "qris" && (
            <div className="rounded-lg border bg-muted/40 p-4 text-center">
              <div className="mx-auto grid h-40 w-40 place-items-center rounded-lg bg-card">
                <QrCode className="h-32 w-32 text-primary" />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Scan QRIS untuk membayar {formatIDR(booking.base_total)}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="proof">Upload bukti pembayaran</Label>
            <div className="flex items-center gap-3">
              <Input id="proof" type="file" accept="image/*" onChange={(e) => setProof(e.target.files?.[0] ?? null)} />
            </div>
            {proof && <p className="text-xs text-muted-foreground">✓ {proof.name}</p>}
          </div>

          <Button className="w-full" disabled={!proof || upload.isPending} onClick={() => upload.mutate()}>
            <Upload className="mr-1.5 h-4 w-4" />
            {upload.isPending ? "Mengirim..." : "Kirim Bukti"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
