import { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { Feature, FeatureCollection, Geometry, Polygon, MultiPolygon } from "geojson";
import alcaldiasData from "@/data/alcaldias.json";
import type { Zone, Risk } from "./FloodMap";

const RISK_BY_NAME: Record<string, Risk> = {
  Iztapalapa: "high",
  "Gustavo A. Madero": "high",
  Xochimilco: "high",
  Tláhuac: "high",
  "Venustiano Carranza": "high",
  Coyoacán: "medium",
  Iztacalco: "medium",
  Cuauhtémoc: "medium",
  Azcapotzalco: "medium",
  Tlalpan: "medium",
  "Álvaro Obregón": "medium",
  "Miguel Hidalgo": "low",
  "Benito Juárez": "low",
  "Cuajimalpa de Morelos": "low",
  "La Magdalena Contreras": "low",
  "Milpa Alta": "low",
};

const RISK_COLOR: Record<Risk, string> = {
  high: "#ef4444",
  medium: "#eab308",
  low: "#22c55e",
};

const geojson = alcaldiasData as unknown as FeatureCollection<
  Geometry,
  { nomgeo: string; cvegeo: string }
>;

const CDMX_CENTER: [number, number] = [19.36, -99.13];

function pointInRing(lng: number, lat: number, ring: number[][]) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersect =
      yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi + 1e-12) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function findAlcaldia(lat: number, lng: number): Zone | null {
  for (const f of geojson.features) {
    const g = f.geometry as Polygon | MultiPolygon;
    const polys = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
    for (const poly of polys) {
      if (pointInRing(lng, lat, poly[0])) {
        const name = f.properties.nomgeo;
        return { id: f.properties.cvegeo, name, risk: RISK_BY_NAME[name] ?? "medium" };
      }
    }
  }
  return null;
}

function FlyTo({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 13, { duration: 1.2 });
  }, [position, map]);
  return null;
}

type Props = {
  onSelectZone?: (z: Zone) => void;
  userPosition?: [number, number] | null;
};

export default function FloodMapInner({ onSelectZone, userPosition }: Props) {
  const geoRef = useRef(null);

  const style = useMemo(
    () => (feature?: Feature<Geometry, { nomgeo: string }>) => {
      const name = feature?.properties?.nomgeo ?? "";
      const risk: Risk = RISK_BY_NAME[name] ?? "medium";
      return {
        color: RISK_COLOR[risk],
        weight: 1.5,
        fillColor: RISK_COLOR[risk],
        fillOpacity: 0.45,
      };
    },
    [],
  );

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={CDMX_CENTER}
        zoom={10}
        scrollWheelZoom
        className="h-full w-full"
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <GeoJSON
          ref={geoRef}
          data={geojson}
          style={style as never}
          onEachFeature={(feature, layer) => {
            const name = (feature.properties as { nomgeo: string }).nomgeo;
            const cvegeo = (feature.properties as { cvegeo: string }).cvegeo;
            const risk: Risk = RISK_BY_NAME[name] ?? "medium";
            layer.bindTooltip(name, {
              permanent: false,
              direction: "center",
              className: "alcaldia-label",
              sticky: true,
            });
            (layer as L.Path).on({
              mouseover: (e) => {
                (e.target as L.Path).setStyle({ weight: 3, fillOpacity: 0.65 });
              },
              mouseout: (e) => {
                (e.target as L.Path).setStyle({ weight: 1.5, fillOpacity: 0.45 });
              },
              click: () => {
                onSelectZone?.({ id: cvegeo, name, risk });
              },
            });
          }}
        />
        <Marker
          position={userPosition ?? CDMX_CENTER}
          icon={L.divIcon({
            className: "",
            html: `<div style="width:14px;height:14px;border-radius:9999px;background:#38bdf8;border:2px solid white;box-shadow:0 0 0 4px rgba(56,189,248,0.35);"></div>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7],
          })}
        >
          <Popup>{userPosition ? "Tu ubicación detectada" : "Centro CDMX — Zócalo"}</Popup>
        </Marker>
        <FlyTo position={userPosition ?? null} />
      </MapContainer>

      {/* Legend — z-5 so modals (z-50) overlay it */}
      <div className="pointer-events-none absolute bottom-3 left-3 z-[5] rounded-md border border-border bg-card/90 px-3 py-2 text-[10px] shadow-lg backdrop-blur">
        <div className="mb-1 font-semibold uppercase tracking-wider text-muted-foreground">
          Riesgo hidráulico
        </div>
        <div className="flex flex-col gap-1">
          {(["high", "medium", "low"] as const).map((r) => (
            <div key={r} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ background: RISK_COLOR[r], opacity: 0.7 }}
              />
              <span className="text-foreground">
                {r === "high" ? "Alto" : r === "medium" ? "Medio" : "Bajo"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
