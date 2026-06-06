import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Navigation,
  FileText,
  Wrench,
  AlertTriangle,
  Phone,
  Send,
  MapPin,
  CheckCircle2,
  Radio,
  Flashlight,
  Droplets,
  HeartPulse,
  Package,
  Battery,
} from "lucide-react";
import { toast } from "sonner";

export type RecKey = "evac" | "docs" | "report" | "kit";

export function RecommendationModal({
  recKey,
  zoneName,
  onClose,
}: {
  recKey: RecKey | null;
  zoneName: string;
  onClose: () => void;
}) {
  return (
    <Dialog open={recKey !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="z-[100] max-h-[90vh] max-w-2xl overflow-y-auto bg-background/95 backdrop-blur-md">
        {recKey === "evac" && <EvacContent zoneName={zoneName} />}
        {recKey === "docs" && <DocsContent />}
        {recKey === "report" && <ReportContent />}
        {recKey === "kit" && <KitContent />}
        <DialogFooter>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EvacContent({ zoneName }: { zoneName: string }) {
  const routes = [
    { name: "Ruta Norte — Av. Insurgentes hacia Lomas", time: "12 min", elev: "+45 m" },
    { name: "Ruta Oeste — Eje 4 hacia Chapultepec", time: "18 min", elev: "+32 m" },
    { name: "Ruta Sur — Periférico hacia Tlalpan Alto", time: "25 min", elev: "+60 m" },
  ];
  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 font-display">
          <Navigation className="h-5 w-5 text-risk-high" /> Rutas de evacuación
        </DialogTitle>
        <DialogDescription>
          Rutas sugeridas hacia zonas elevadas desde <strong>{zoneName}</strong>.
        </DialogDescription>
      </DialogHeader>

      {/* Simulated mini-map */}
      <div className="relative h-44 overflow-hidden rounded-md border border-border bg-gradient-to-br from-primary/10 via-card to-background">
        <svg viewBox="0 0 400 180" className="h-full w-full">
          <defs>
            <pattern id="grid-r" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M20 0H0V20" fill="none" stroke="currentColor" strokeOpacity="0.08" />
            </pattern>
          </defs>
          <rect width="400" height="180" fill="url(#grid-r)" />
          {/* Danger zone */}
          <ellipse cx="200" cy="100" rx="80" ry="40" fill="#ef4444" fillOpacity="0.25" stroke="#ef4444" strokeDasharray="4 3" />
          {/* Safe zones */}
          <circle cx="60" cy="40" r="22" fill="#22c55e" fillOpacity="0.35" stroke="#22c55e" />
          <circle cx="340" cy="50" r="22" fill="#22c55e" fillOpacity="0.35" stroke="#22c55e" />
          <circle cx="340" cy="150" r="22" fill="#22c55e" fillOpacity="0.35" stroke="#22c55e" />
          {/* Routes */}
          <path d="M200 100 Q 130 70 60 40" stroke="#38bdf8" strokeWidth="2.5" fill="none" strokeDasharray="6 4" />
          <path d="M200 100 Q 270 70 340 50" stroke="#38bdf8" strokeWidth="2.5" fill="none" strokeDasharray="6 4" />
          <path d="M200 100 Q 270 130 340 150" stroke="#38bdf8" strokeWidth="2.5" fill="none" strokeDasharray="6 4" />
          {/* User */}
          <circle cx="200" cy="100" r="6" fill="#38bdf8" stroke="white" strokeWidth="2" />
          <text x="208" y="96" fill="currentColor" fontSize="9" opacity="0.7">Tú</text>
          <text x="20" y="22" fill="#22c55e" fontSize="9" fontWeight="bold">Zona segura</text>
        </svg>
      </div>

      <div className="space-y-2">
        {routes.map((r) => (
          <div
            key={r.name}
            className="flex items-center justify-between rounded-md border border-border bg-card/60 p-3 text-xs"
          >
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="font-medium">{r.name}</span>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">{r.time}</Badge>
              <Badge variant="outline" className="text-risk-low">{r.elev}</Badge>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-xs">
        <div className="mb-2 flex items-center gap-2 font-semibold">
          <Phone className="h-4 w-4 text-primary" /> Teléfonos de Protección Civil
        </div>
        <ul className="space-y-1 text-muted-foreground">
          <li>• <strong className="text-foreground">911</strong> — Emergencias</li>
          <li>• <strong className="text-foreground">5658-1111</strong> — Protección Civil CDMX</li>
          <li>• <strong className="text-foreground">072</strong> — LOCATEL / Reportes</li>
        </ul>
      </div>
    </>
  );
}

function DocsContent() {
  const [items, setItems] = useState([
    { id: "id", label: "Identificaciones oficiales (INE, pasaporte)", done: false },
    { id: "esc", label: "Escrituras y contratos de propiedad", done: false },
    { id: "med", label: "Recetas médicas y carnet de vacunación", done: false },
    { id: "bag", label: "Guardar en bolsas herméticas (Ziploc)", done: false },
    { id: "cloud", label: "Subir copias digitalizadas a la nube", done: false },
    { id: "cash", label: "Tener efectivo en billetes pequeños", done: false },
  ]);
  const completed = items.filter((i) => i.done).length;

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 font-display">
          <FileText className="h-5 w-5 text-risk-medium" /> Asegura tus documentos
        </DialogTitle>
        <DialogDescription>
          Checklist interactiva. Marca cada elemento conforme lo completes.
        </DialogDescription>
      </DialogHeader>

      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          Progreso: <strong className="text-foreground">{completed}/{items.length}</strong>
        </span>
        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-risk-low transition-all"
            style={{ width: `${(completed / items.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <label
            key={item.id}
            className="flex cursor-pointer items-center gap-3 rounded-md border border-border bg-card/60 p-3 text-sm hover:bg-accent/40"
          >
            <Checkbox
              checked={item.done}
              onCheckedChange={(v) =>
                setItems((prev) =>
                  prev.map((i) => (i.id === item.id ? { ...i, done: Boolean(v) } : i)),
                )
              }
            />
            <span className={item.done ? "text-muted-foreground line-through" : "text-foreground"}>
              {item.label}
            </span>
            {item.done && <CheckCircle2 className="ml-auto h-4 w-4 text-risk-low" />}
          </label>
        ))}
      </div>
    </>
  );
}

function ReportContent() {
  const [location, setLocation] = useState("");
  const [desc, setDesc] = useState("");
  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 font-display">
          <Wrench className="h-5 w-5 text-risk-low" /> Reportar coladera obstruida
        </DialogTitle>
        <DialogDescription>
          Tu reporte se envía directo a <strong>SACMEX / Sistema de Aguas</strong>.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Ubicación de la coladera
          </label>
          <Input
            placeholder="Calle, número y colonia"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Descripción del problema
          </label>
          <Textarea
            placeholder="Ej. Coladera tapada con basura, agua estancada de 30 cm…"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={3}
          />
        </div>

        <Button
          className="w-full gap-2"
          disabled={!location || !desc}
          onClick={() => {
            toast.success("Reporte enviado a SACMEX. Folio: #SX-2026-" + Math.floor(Math.random() * 9999));
            setLocation("");
            setDesc("");
          }}
        >
          <Send className="h-4 w-4" /> Enviar reporte directo a SACMEX
        </Button>

        <div className="flex items-center gap-3 rounded-md border border-primary/30 bg-primary/5 p-3 text-xs">
          <Phone className="h-5 w-5 shrink-0 text-primary" />
          <div>
            <div className="font-semibold text-foreground">Atención rápida: 072</div>
            <div className="text-muted-foreground">
              LOCATEL CDMX · Reportes 24/7 de drenaje, alumbrado y baches.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function KitContent() {
  const items = [
    { icon: Droplets, label: "Agua embotellada", detail: "3 L por persona × 3 días" },
    { icon: Flashlight, label: "Linterna LED", detail: "+ pilas de repuesto" },
    { icon: Radio, label: "Radio de pilas", detail: "AM/FM o manivela" },
    { icon: HeartPulse, label: "Botiquín de primeros auxilios", detail: "Vendas, antisépticos" },
    { icon: Package, label: "Alimentos no perecederos", detail: "Latas, barras, frutos secos" },
    { icon: Battery, label: "Power bank cargado", detail: "Mín. 10,000 mAh" },
  ];
  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 font-display">
          <AlertTriangle className="h-5 w-5 text-primary" /> Kit de emergencia
        </DialogTitle>
        <DialogDescription>
          Insumos esenciales para sobrevivir las primeras 72 horas.
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((it) => (
          <div
            key={it.label}
            className="flex items-start gap-3 rounded-md border border-border bg-card/60 p-3"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/15">
              <it.icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="text-sm font-semibold">{it.label}</div>
              <div className="text-xs text-muted-foreground">{it.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
