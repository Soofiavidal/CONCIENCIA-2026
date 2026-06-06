import { lazy, Suspense, useEffect, useState } from "react";

export type Risk = "high" | "medium" | "low";
export type Zone = { id: string; name: string; risk: Risk };

const FloodMapInner = lazy(() => import("./FloodMapInner"));

// Re-export helper (only used client-side after dynamic import)
export async function resolveAlcaldia(lat: number, lng: number) {
  const mod = await import("./FloodMapInner");
  return mod.findAlcaldia(lat, lng);
}

type Props = {
  onSelectZone?: (z: Zone) => void;
  userPosition?: [number, number] | null;
};

export function FloodMap(props: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-md border border-border bg-card/40 text-xs text-muted-foreground">
        Cargando mapa…
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center rounded-md border border-border bg-card/40 text-xs text-muted-foreground">
          Cargando mapa…
        </div>
      }
    >
      <FloodMapInner {...props} />
    </Suspense>
  );
}
