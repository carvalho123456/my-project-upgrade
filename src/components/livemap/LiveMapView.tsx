import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, Crosshair, Loader2, RefreshCw } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/integrations/supabase/client";
import {
  CARAGUA_CENTER,
  confidenceBand,
  displayStatus,
  distanceMeters,
  kindMeta,
  relativeTime,
  severityMeta,
  type LiveAlert,
} from "@/lib/liveAlerts";
import { fetchLiveAlerts } from "@/lib/liveAlertsApi";
import LiveAlertFilters, { DEFAULT_FILTERS, type AlertFilters } from "./LiveAlertFilters";
import LiveAlertLegend from "./LiveAlertLegend";
import LiveAlertDetail from "./LiveAlertDetail";
import LiveAlertForm from "./LiveAlertForm";

/** Raio do círculo de intensidade, reforçado pela confiabilidade do alerta. */
const areaRadius = (alert: LiveAlert) => 140 + alert.confidence * 2.4;

const LiveMapView = () => {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const meRef = useRef<L.LayerGroup | null>(null);
  const pickingRef = useRef(false);

  const [filters, setFilters] = useState<AlertFilters>(DEFAULT_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [point, setPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [myPosition, setMyPosition] = useState<{ lat: number; lng: number } | null>(null);
  // Recarrega a cada minuto só para refletir o decaimento temporal na tela.
  const [tick, setTick] = useState(0);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["live-alerts"],
    queryFn: fetchLiveAlerts,
    refetchInterval: 60_000,
  });

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  // Tempo real: qualquer relato ou confirmação atualiza o mapa de todos.
  useEffect(() => {
    const channel = supabase
      .channel("live-alerts-map")
      .on("postgres_changes", { event: "*", schema: "public", table: "live_alerts" }, () => {
        void refetch();
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refetch]);

  const alerts = useMemo(() => {
    const now = Date.now();
    void tick;
    return (data ?? [])
      .filter((a) => displayStatus(a, now) !== "expirado")
      .filter((a) => (filters.kind === "todos" ? true : a.kind === filters.kind))
      .filter((a) => (filters.severity === "todos" ? true : a.severity === filters.severity))
      .filter((a) => now - new Date(a.created_at).getTime() <= filters.hours * 3600_000)
      .filter((a) =>
        filters.neighborhood.trim()
          ? a.neighborhood.toLowerCase().includes(filters.neighborhood.trim().toLowerCase())
          : true,
      )
      .sort((a, b) => {
        // Prioriza próximo, grave e recente.
        const dist = (x: LiveAlert) =>
          myPosition ? distanceMeters(myPosition.lat, myPosition.lng, x.lat, x.lng) : 0;
        const rank = (x: LiveAlert) =>
          -dist(x) / 5000 +
          ({ critico: 3, alto: 2, moderado: 1, baixo: 0 }[x.severity] ?? 0) +
          (now - new Date(x.last_confirmed_at).getTime() < 3600_000 ? 1.5 : 0);
        return rank(b) - rank(a);
      });
  }, [data, filters, myPosition, tick]);

  const selected = alerts.find((a) => a.id === selectedId) ?? null;

  // --- mapa ---
  useEffect(() => {
    if (!mapEl.current || mapRef.current) return;
    const map = L.map(mapEl.current, { scrollWheelZoom: false }).setView(CARAGUA_CENTER, 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    meRef.current = L.layerGroup().addTo(map);
    map.on("click", (e: L.LeafletMouseEvent) => {
      if (!pickingRef.current) return;
      setPoint({ lat: e.latlng.lat, lng: e.latlng.lng });
      setPicking(false);
      pickingRef.current = false;
      toast.success("Local escolhido no mapa.");
    });
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
      meRef.current = null;
    };
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.clearLayers();
    const now = Date.now();

    alerts.forEach((alert) => {
      const sev = severityMeta(alert.severity);
      const kind = kindMeta(alert.kind);
      const fading = displayStatus(alert, now) === "esmaecendo";
      const opacity = fading ? 0.4 : 1;

      L.circle([alert.lat, alert.lng], {
        radius: areaRadius(alert),
        color: sev.color,
        weight: 1.5,
        opacity,
        fillColor: sev.color,
        fillOpacity: fading ? 0.08 : 0.22,
      }).addTo(layer);

      const icon = L.divIcon({
        className: "live-alert-marker",
        html: `<div style="opacity:${opacity};width:30px;height:30px;border-radius:50%;background:${sev.color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center"><span style="font-size:14px">${kind.emoji}</span></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      L.marker([alert.lat, alert.lng], {
        icon,
        title: `${kind.label} — ${sev.note}`,
      })
        .addTo(layer)
        .on("click", () => setSelectedId(alert.id));
    });
  }, [alerts]);

  useEffect(() => {
    const layer = meRef.current;
    if (!layer) return;
    layer.clearLayers();
    if (!myPosition) return;
    L.circleMarker([myPosition.lat, myPosition.lng], {
      radius: 7,
      color: "#1565C0",
      weight: 3,
      fillColor: "#fff",
      fillOpacity: 1,
    })
      .addTo(layer)
      .bindTooltip("Você está por aqui");
  }, [myPosition]);

  useEffect(() => {
    if (!selected || !mapRef.current) return;
    mapRef.current.panTo([selected.lat, selected.lng]);
  }, [selected]);

  /** Localização só é lida a partir de um clique explícito do morador. */
  const locate = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      toast.error("Seu navegador não permite obter a localização.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setMyPosition(p);
        setPoint(p);
        mapRef.current?.setView([p.lat, p.lng], 15);
        toast.success("Mostrando as ocorrências perto de você.");
      },
      () => toast.error("Não conseguimos acessar sua localização. Você pode escolher o ponto no mapa."),
    );
  }, []);

  const startPicking = () => {
    const next = !picking;
    setPicking(next);
    pickingRef.current = next;
    if (next) toast.info("Toque no mapa para marcar o local da ocorrência.");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <LiveAlertFilters value={filters} onChange={setFilters} />
        <button
          onClick={locate}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110"
        >
          <Crosshair className="h-4 w-4" /> Riscos perto de mim
        </button>
        <button
          onClick={() => void refetch()}
          aria-label="Atualizar alertas"
          className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-sm font-semibold text-foreground"
        >
          {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Atualizar
        </button>
      </div>

      {isError && (
        <div className="flex items-start gap-2 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-alert-warning" />
          Não foi possível carregar os alertas colaborativos agora. Tente atualizar em instantes.
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="overflow-hidden rounded-xl border border-border shadow-elevated">
            <div ref={mapEl} className="h-[420px] w-full sm:h-[560px]" />
          </div>
          <LiveAlertLegend />
        </div>

        <div className="space-y-4">
          {selected ? (
            <LiveAlertDetail
              alert={selected}
              userPosition={myPosition}
              onClose={() => setSelectedId(null)}
              onChanged={() => void refetch()}
            />
          ) : (
            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <h3 className="mb-3 font-heading font-bold text-foreground">
                Ocorrências relatadas {myPosition ? "perto de você" : "na cidade"}
              </h3>
              {isLoading && <div className="h-20 animate-pulse rounded-lg bg-muted" />}
              {!isLoading && alerts.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhuma ocorrência ativa com esses filtros. Isso não significa que a cidade
                  esteja livre de riscos — apenas que ninguém relatou nada por aqui.
                </p>
              )}
              <ul className="space-y-2">
                {alerts.slice(0, 8).map((a) => {
                  const sev = severityMeta(a.severity);
                  const kind = kindMeta(a.kind);
                  return (
                    <li key={a.id}>
                      <button
                        onClick={() => setSelectedId(a.id)}
                        className="w-full rounded-lg border border-border p-3 text-left transition hover:bg-secondary"
                      >
                        <span className="flex items-center gap-2">
                          <span aria-hidden>{kind.emoji}</span>
                          <span className="text-sm font-semibold text-foreground">{kind.label}</span>
                          <span
                            className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                            style={{ background: sev.color }}
                          >
                            {sev.label}
                          </span>
                        </span>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {a.neighborhood} • {relativeTime(a.last_confirmed_at)} • confiabilidade{" "}
                          {confidenceBand(a.confidence)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <LiveAlertForm
            point={point}
            pickingOnMap={picking}
            onPickOnMap={startPicking}
            onUseMyLocation={locate}
            onCreated={() => void refetch()}
          />
        </div>
      </div>
    </div>
  );
};

export default LiveMapView;
