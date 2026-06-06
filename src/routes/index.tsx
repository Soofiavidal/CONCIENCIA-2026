import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Shield,
  MapPin,
  Locate,
  AlertTriangle,
  Activity,
  Brain,
  FileSearch,
  Edit3,
  Trash2,
  Droplets,
  CheckCircle2,
  Info,
  Navigation,
  FileText,
  Wrench,
  Download,
} from "lucide-react";
import { FloodMap, resolveAlcaldia, type Zone } from "@/components/FloodMap";
import { RecommendationModal, type RecKey } from "@/components/RecommendationModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

// Alcaldías céntricas / con alta densidad de datos hidrometeorológicos → Escenario A.
// El resto (periféricas o con datos limitados) → Escenario B (inferencia por analogía).
const CENTRAL_ALCALDIAS = new Set<string>([
  "Cuauhtémoc",
  "Benito Juárez",
  "Miguel Hidalgo",
  "Coyoacán",
  "Iztacalco",
  "Venustiano Carranza",
  "Azcapotzalco",
]);

function scenarioForZone(zone: Zone | null): "A" | "B" {
  if (!zone) return "A";
  return CENTRAL_ALCALDIAS.has(zone.name) ? "A" : "B";
}


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FloodMirror AI — Gemelo Digital Urbano de Inundaciones CDMX" },
      {
        name: "description",
        content:
          "Dashboard inteligente de predicción de riesgo de inundaciones para la Ciudad de México con IA explicable y respeto a la privacidad (LFPDPPP).",
      },
    ],
  }),
  component: Dashboard,
});



const riskLabel: Record<Zone["risk"], string> = {
  high: "Alto",
  medium: "Medio",
  low: "Bajo",
};

const riskTokenVar: Record<Zone["risk"], string> = {
  high: "var(--risk-high)",
  medium: "var(--risk-medium)",
  low: "var(--risk-low)",
};

function Dashboard() {
  const [consent, setConsent] = useState(false);
  const [address, setAddress] = useState("");
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [activeRec, setActiveRec] = useState<RecKey | null>(null);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [lastAddress, setLastAddress] = useState<string>("");
  const [locating, setLocating] = useState(false);
  const [privacyBannerAccepted, setPrivacyBannerAccepted] = useState(false);
  const [privacyBannerClosing, setPrivacyBannerClosing] = useState(false);

  const acceptPrivacyBanner = () => {
    setPrivacyBannerClosing(true);
    setTimeout(() => setPrivacyBannerAccepted(true), 300);
  };

  const scenario = scenarioForZone(selectedZone);
  const dataSufficient = scenario === "A";
  const confidence = dataSufficient ? 90 : 64;
  const currentRisk: Zone["risk"] = selectedZone?.risk ?? "medium";

  const handleDelete = () => {
    setDeleteOpen(false);
    setAccessOpen(false);
    setConsent(false);
    setAddress("");
    setLastAddress("");
    setSelectedZone(null);
    setUserPosition(null);
    toast.success("Historial de ubicación local borrado correctamente.");
  };

  const handleDetectLocation = () => {
    if (!consent) {
      toast.error("Por favor, acepta el aviso de consentimiento de ubicación antes de continuar.");
      return;
    }
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      toast.error("Tu navegador no soporta geolocalización.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserPosition([lat, lng]);
        const zone = await resolveAlcaldia(lat, lng);
        if (zone) {
          setSelectedZone(zone);
          toast.success(`Ubicación detectada en ${zone.name}.`);
        } else {
          setSelectedZone(null);
          toast.warning("Estás fuera de la CDMX. Marcador colocado, sin zona asignada.");
        }
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        toast.error(`No se pudo obtener tu ubicación: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };


  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* SIDEBAR */}
      <aside className="hidden w-80 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex items-center gap-2 border-b border-sidebar-border px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/15">
            <Droplets className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold tracking-tight">FloodMirror AI</h1>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Gemelo digital urbano
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {/* Privacy banner */}
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
            <div className="flex items-start gap-2">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="text-xs">
                <div className="font-semibold text-foreground">Aviso de Privacidad</div>
                <p className="mt-1 leading-relaxed text-muted-foreground">
                  Sus datos se tratan conforme a la <strong>LFPDPPP</strong> mexicana.
                </p>
                <button
                  onClick={() => setPrivacyOpen(true)}
                  className="mt-1 inline-block text-primary underline hover:no-underline"
                >
                  Leer aviso completo →
                </button>
              </div>
            </div>
          </div>

          {/* Selected zone (from map click) */}
          {selectedZone && (
            <div
              className="mt-4 rounded-lg border p-3 text-xs"
              style={{
                borderColor: `color-mix(in oklch, ${riskTokenVar[selectedZone.risk]} 50%, transparent)`,
                background: `color-mix(in oklch, ${riskTokenVar[selectedZone.risk]} 10%, transparent)`,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold text-foreground">Zona seleccionada</div>
                <button
                  className="text-[10px] text-muted-foreground underline"
                  onClick={() => setSelectedZone(null)}
                >
                  limpiar
                </button>
              </div>
              <div className="mt-1 font-display text-base font-bold">{selectedZone.name}</div>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: riskTokenVar[selectedZone.risk] }}
                />
                <span className="text-muted-foreground">
                  Riesgo específico: <strong style={{ color: riskTokenVar[selectedZone.risk] }}>{riskLabel[selectedZone.risk]}</strong>
                </span>
              </div>
            </div>
          )}

          {/* Consent */}
          <label className="mt-4 flex cursor-pointer items-start gap-2 rounded-md border border-border bg-card p-3 text-xs">
            <Checkbox
              checked={consent}
              onCheckedChange={(v) => setConsent(Boolean(v))}
              className="mt-0.5"
            />
            <span className="leading-relaxed text-muted-foreground">
              Consiento explícitamente el uso de mi ubicación para la estimación del riesgo de
              inundación.
            </span>
          </label>

          {/* Location */}
          <div className="mt-5">
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Ubicación
            </div>
            <Button
              className="w-full justify-start gap-2"
              variant="secondary"
              onClick={handleDetectLocation}
              disabled={locating}
            >
              <Locate className={`h-4 w-4 ${locating ? "animate-spin" : ""}`} />
              {locating ? "Detectando…" : "Detectar mi ubicación automática"}
            </Button>

            <div className="my-3 flex items-center gap-2 text-[10px] uppercase text-muted-foreground">
              <Separator className="flex-1" /> o <Separator className="flex-1" />
            </div>
            <div className="relative">
              <MapPin className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Av. Reforma 100, CDMX"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button
              disabled={!consent || !address}
              className="mt-2 w-full"
              onClick={() => {
                setLastAddress(address);
                const match = address.toLowerCase();
                const riskByName: Record<string, Zone["risk"]> = {
                  "Iztapalapa": "high", "Gustavo A. Madero": "high", "Xochimilco": "high",
                  "Tláhuac": "high", "Venustiano Carranza": "high",
                  "Coyoacán": "medium", "Iztacalco": "medium", "Cuauhtémoc": "medium",
                  "Azcapotzalco": "medium", "Tlalpan": "medium", "Álvaro Obregón": "medium",
                  "Miguel Hidalgo": "low", "Benito Juárez": "low",
                  "Cuajimalpa de Morelos": "low", "La Magdalena Contreras": "low", "Milpa Alta": "low",
                };
                const known = Object.keys(riskByName).find((n) =>
                  match.includes(n.toLowerCase()),
                );
                if (known) {
                  setSelectedZone({ id: known, name: known, risk: riskByName[known] });
                  toast.success(`Riesgo estimado para ${known}.`);
                } else {
                  toast.info(`Riesgo estimado para: ${address}`);
                }
              }}
            >
              Estimar riesgo
            </Button>
          </div>

          <Separator className="my-6" />

          {/* ARCO rights — abiertos al público (gestión local sin cuenta) */}
          <div>
            <div className="mb-3 rounded-md border border-primary/30 bg-primary/5 px-2.5 py-2 text-[11px] leading-snug text-muted-foreground">
              <Shield className="mr-1 inline h-3 w-3 text-primary" />
              App abierta al público. Tus Derechos ARCO se gestionan de forma local
              sobre los datos de esta sesión del navegador.
            </div>

            <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Shield className="h-3 w-3" />
              Derechos ARCO — Gestión local
            </div>

            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => setAccessOpen(true)}
              >
                <FileSearch className="h-4 w-4" /> Acceder a mis datos
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => toast.info("Edita tu dirección o detecta de nuevo tu ubicación para rectificar los datos de esta sesión.")}
              >
                <Edit3 className="h-4 w-4" /> Rectificar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4" /> Eliminar mis datos de ubicación
              </Button>
            </div>
          </div>


        </div>

        <div className="border-t border-sidebar-border px-5 py-3 text-[10px] text-muted-foreground">
          © 2026 FloodMirror AI · IA Responsable
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 overflow-x-hidden">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card/40 px-6 py-4 backdrop-blur">
          <div>
            <h2 className="font-display text-xl font-bold">Panel de Visualización</h2>
            <p className="text-xs text-muted-foreground">
              Monitoreo en tiempo real · Ciudad de México · Última actualización hace 3 min
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="gap-1.5"
              style={{ color: riskTokenVar[currentRisk], borderColor: `color-mix(in oklch, ${riskTokenVar[currentRisk]} 40%, transparent)` }}
            >
              <span
                className="h-2 w-2 animate-pulse rounded-full"
                style={{ background: riskTokenVar[currentRisk] }}
              />
              Riesgo: {riskLabel[currentRisk]}
            </Badge>
            <Badge variant="outline" className="gap-1.5">
              <Activity className="h-3 w-3" /> Sistema en línea
            </Badge>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-5 p-5 xl:grid-cols-3">
          <section className="xl:col-span-2">
            <Card className="overflow-hidden p-0">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div>
                  <h3 className="font-display text-sm font-semibold">Mapa de Riesgo Hidráulico</h3>
                  <p className="text-xs text-muted-foreground">
                    Capas de polígonos sobre CDMX · Click para inspeccionar
                  </p>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  Simulación Leaflet
                </Badge>
              </div>
              <div className="h-[480px] p-3">
                <FloodMap
                  userPosition={userPosition}
                  onSelectZone={(z) => {
                    setSelectedZone(z);
                    toast.info(`Zona ${z.name} — riesgo ${riskLabel[z.risk]}`);
                  }}
                />

              </div>
            </Card>
          </section>

          <section className="space-y-5">
            <Card className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                <h3 className="font-display text-sm font-semibold">Nivel de Confianza</h3>
              </div>
              <div className="mb-1 flex items-baseline justify-between">
                <span className="font-display text-3xl font-bold text-foreground">
                  {confidence}%
                </span>
                <span className="text-xs text-muted-foreground">predicción</span>
              </div>
              <Progress value={confidence} className="h-2" />
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                Calculado a partir de la similitud geomorfológica con los territorios de inferencia. A menor distancia matemática entre las zonas, mayor es la confianza del resultado.
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                Basado en {dataSufficient ? "147" : "32"} fuentes hidrometeorológicas activas.
              </p>
              <div className="mt-3 flex items-center gap-2 rounded-md border border-border bg-card/40 px-2.5 py-1.5 text-[10px] text-muted-foreground">
                <Info className="h-3 w-3 text-primary" />
                Escenario <strong className="text-foreground">{scenario}</strong> activado
                automáticamente según la zona consultada
                {selectedZone ? ` (${selectedZone.name})` : ""}.
              </div>
            </Card>

            <Card className="p-5">
              <div className="mb-2 flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                <h3 className="font-display text-sm font-semibold">Explicación del Resultado</h3>
              </div>
              {dataSufficient ? (
                <div className="rounded-md border border-risk-low/30 bg-risk-low/5 p-3 text-xs">
                  <div className="mb-1 flex items-center gap-1.5 font-semibold text-risk-low">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Datos locales suficientes detectados
                  </div>
                  <p className="leading-relaxed text-muted-foreground">
                    Conectado a estaciones meteorológicas de CDMX.{" "}
                    <strong className="text-foreground">Confianza Alta.</strong> Predicción directa
                    basada en registros de las últimas 72 horas.
                  </p>
                </div>
              ) : (
                <div className="rounded-md border border-risk-medium/30 bg-risk-medium/5 p-3 text-xs">
                  <div className="mb-1 flex items-center gap-1.5 font-semibold text-risk-medium">
                    <AlertTriangle className="h-3.5 w-3.5" /> Inferencia inteligente activada
                    <TooltipProvider delayDuration={150}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
                            aria-label="¿Cómo funciona la inferencia?"
                          >
                            <Info className="h-3 w-3" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-xs leading-relaxed">
                          Nuestra IA analiza variables físicas (como pendientes y asfalto) para
                          emparejar esta zona con 5 lugares de la CDMX y Estado de México que sí
                          tienen historial de inundaciones, estimando así el riesgo por analogía.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="leading-relaxed text-muted-foreground">
                    Datos locales insuficientes. El riesgo se calcula como el promedio de la probabilidad de inundación de los 5 territorios más similares encontrados por el algoritmo Mirror.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {[
                      "Naucalpan",
                      "Tlalnepantla",
                      "Ecatepec",
                      "Álvaro Obregón",
                      "Gustavo A. Madero",
                    ].map((t) => (
                      <Badge key={t} variant="outline" className="text-[10px]">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>

              )}
            </Card>

          </section>
        </div>

        <section className="px-5 pb-8">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold">Recomendaciones Preventivas</h3>
              <p className="text-xs text-muted-foreground">
                Acciones sugeridas para nivel de riesgo <strong>{riskLabel[currentRisk]}</strong>
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {([
              {
                key: "evac" as const,
                icon: Navigation,
                title: "Rutas de evacuación",
                desc: "Identifica al menos dos rutas elevadas hacia zonas seguras desde tu domicilio.",
                color: "var(--risk-high)",
              },
              {
                key: "docs" as const,
                icon: FileText,
                title: "Asegura tus documentos",
                desc: "Guarda identificaciones y escrituras en bolsas impermeables o digitaliza copias.",
                color: "var(--risk-medium)",
              },
              {
                key: "report" as const,
                icon: Wrench,
                title: "Reporta coladeras obstruidas",
                desc: "Llama al 072 o usa la app de la CDMX para reportar drenajes bloqueados.",
                color: "var(--risk-low)",
              },
              {
                key: "kit" as const,
                icon: AlertTriangle,
                title: "Kit de emergencia",
                desc: "Agua para 3 días, linterna, radio, medicamentos básicos y números de contacto.",
                color: "var(--primary)",
              },
            ]).map((r) => (
              <button
                key={r.title}
                onClick={() => setActiveRec(r.key)}
                className="group text-left"
              >
                <Card className="h-full p-4 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-accent/40 hover:shadow-lg">
                  <div
                    className="mb-3 flex h-9 w-9 items-center justify-center rounded-md transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `color-mix(in oklch, ${r.color} 18%, transparent)` }}
                  >
                    <r.icon className="h-4 w-4" style={{ color: r.color }} />
                  </div>
                  <h4 className="mb-1 font-display text-sm font-semibold">{r.title}</h4>
                  <p className="text-xs leading-relaxed text-muted-foreground">{r.desc}</p>
                  <div className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Ver detalles →
                  </div>
                </Card>
              </button>
            ))}
          </div>
        </section>
      </main>

      <RecommendationModal
        recKey={activeRec}
        zoneName={selectedZone?.name ?? "tu zona"}
        onClose={() => setActiveRec(null)}
      />

      {/* PRIVACY MODAL */}
      <Dialog open={privacyOpen} onOpenChange={setPrivacyOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <Shield className="h-5 w-5 text-primary" />
              Aviso de Privacidad — FloodMirror AI
            </DialogTitle>
            <DialogDescription>
              Conforme a la Ley Federal de Protección de Datos Personales en Posesión de los
              Particulares (LFPDPPP).
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] space-y-3 overflow-y-auto text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Responsable:</strong> FloodMirror AI S.A. de C.V.,
              con domicilio en Ciudad de México, es responsable del tratamiento de sus datos
              personales.
            </p>
            <p>
              <strong className="text-foreground">Datos recabados:</strong> coordenadas de
              geolocalización, dirección postal proporcionada y metadatos del dispositivo. No se
              recaban datos sensibles.
            </p>
            <p>
              <strong className="text-foreground">Finalidades:</strong> estimar el riesgo de
              inundación en su zona, generar recomendaciones preventivas y mejorar el modelo de
              inferencia con datos agregados y anonimizados.
            </p>
            <p>
              <strong className="text-foreground">Transferencias:</strong> no se transfieren sus
              datos a terceros sin su consentimiento expreso, salvo requerimiento de autoridad
              competente.
            </p>
            <p>
              <strong className="text-foreground">Derechos ARCO:</strong> usted puede ejercer en
              cualquier momento sus derechos de Acceso, Rectificación, Cancelación y Oposición
              directamente desde el panel lateral o escribiendo a privacidad@floodmirror.ai.
            </p>
            <p>
              <strong className="text-foreground">Cambios al aviso:</strong> cualquier modificación
              será notificada a través de esta misma interfaz.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setPrivacyOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION MODAL */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="z-[100] max-w-md border-destructive/40 bg-background/95 backdrop-blur-md">
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/15">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-center font-display text-destructive">
              ¿Estás seguro?
            </DialogTitle>
            <DialogDescription className="text-center">
              ¿Deseas eliminar todo el historial de ubicación de esta sesión del navegador?
              El mapa volverá a su vista general de la CDMX. Acción irreversible conforme a tus
              Derechos ARCO.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-1.5 h-4 w-4" /> Sí, eliminar definitivamente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ACCESS DATA MODAL — Derecho de Acceso ARCO */}
      <Dialog open={accessOpen} onOpenChange={setAccessOpen}>
        <DialogContent className="z-[100] max-h-[90vh] max-w-2xl overflow-y-auto bg-background/95 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <FileSearch className="h-5 w-5 text-primary" />
              Tus Datos Personales — Derecho de Acceso
            </DialogTitle>
            <DialogDescription>
              Información que FloodMirror AI tiene almacenada sobre ti, conforme a la LFPDPPP.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-card/40 p-4">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Última ubicación detectada
              </div>
              {userPosition || lastAddress || address || selectedZone ? (
                <ul className="space-y-1.5 text-sm">
                  {userPosition && (
                    <li className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="font-mono text-xs text-foreground">
                        Coordenadas actuales — Lat: {userPosition[0].toFixed(5)}, Lon:{" "}
                        {userPosition[1].toFixed(5)}
                      </span>
                    </li>
                  )}
                  {(lastAddress || address) && (
                    <li className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="text-foreground">{lastAddress || address}</span>
                    </li>
                  )}
                  {selectedZone && (
                    <li className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="text-foreground">
                        Zona consultada: <strong>{selectedZone.name}</strong>
                      </span>
                    </li>
                  )}
                </ul>
              ) : (
                <p className="text-sm italic text-muted-foreground">
                  Aún no has consultado una ubicación en esta sesión.
                </p>
              )}
            </div>

            <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-xs leading-relaxed text-muted-foreground">
              <Shield className="mr-1 inline h-3.5 w-3.5 text-primary" />
              <strong className="text-foreground">Tiempo de permanencia:</strong> tus datos de
              ubicación se procesan temporalmente en la memoria de tu navegador (sesión activa) y
              no se almacenan de forma permanente en servidores externos. Al cerrar la pestaña o
              pulsar &quot;Eliminar&quot;, se borran por completo.
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                const payload = {
                  ubicacion: {
                    coordenadas: userPosition
                      ? { lat: userPosition[0], lon: userPosition[1] }
                      : null,
                    direccion: lastAddress || address || null,
                    zonaConsultada: selectedZone?.name ?? null,
                  },
                  retencion:
                    "Procesado en memoria del navegador. Sin almacenamiento permanente en servidores.",
                  minimizacion:
                    "No se recolectan datos sensibles, género, teléfono ni fecha de nacimiento.",
                  exportadoEn: new Date().toISOString(),
                };
                const blob = new Blob([JSON.stringify(payload, null, 2)], {
                  type: "application/json",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "floodmirror-mis-datos.json";
                a.click();
                URL.revokeObjectURL(url);
                toast.success("Descarga iniciada (formato JSON).");
              }}
            >
              <Download className="h-4 w-4" /> Descargar mis datos en formato JSON
            </Button>
            <Button onClick={() => setAccessOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PRIVACY CONSENT BANNER (LFPDPPP) — blocks interaction until accepted */}
      {!privacyBannerAccepted && (
        <div
          className={`fixed inset-0 z-[200] flex items-end justify-center bg-background/40 backdrop-blur-sm ${
            privacyBannerClosing ? "animate-fade-out" : "animate-fade-in"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Aviso de privacidad y geolocalización"
        >
          <div className="m-4 w-full max-w-3xl rounded-xl border border-primary/30 bg-card/95 p-5 shadow-2xl backdrop-blur-md sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 text-sm leading-relaxed text-muted-foreground">
                <div className="mb-1 font-display text-sm font-semibold text-foreground">
                  Aviso de privacidad
                </div>
                Utilizamos tu geolocalización de forma temporal para calcular el riesgo de
                inundación en tu zona. Los datos se procesan localmente en tu navegador y no se
                guardan en servidores externos. Al continuar navegando, aceptas nuestra{" "}
                <button
                  type="button"
                  onClick={() => setPrivacyOpen(true)}
                  className="text-primary underline hover:no-underline"
                >
                  Política de Privacidad
                </button>
                .
              </div>
              <Button
                size="lg"
                onClick={acceptPrivacyBanner}
                className="shrink-0 gap-2"
              >
                <CheckCircle2 className="h-4 w-4" /> Aceptar y Continuar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
