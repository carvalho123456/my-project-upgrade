import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Droplets, Mountain, Users } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/integrations/supabase/client";

const HAZARD_COLORS: Record<string, string> = {
  alagamento: "#2196F3",
  deslizamento: "#E65100",
  vendaval: "#7E57C2",
  ressaca: "#00897B",
  outro: "#607D8B",
};

const HAZARD_EMOJI: Record<string, string> = {
  alagamento: "💧",
  deslizamento: "⛰️",
  vendaval: "🌬️",
  ressaca: "🌊",
  outro: "⚠️",
};

const HAZARD_LABEL: Record<string, string> = {
  alagamento: "Alagamento",
  deslizamento: "Deslizamento",
  vendaval: "Vendaval",
  ressaca: "Ressaca",
  outro: "Outro",
};

const fetchMapData = async () => {
  const [zones, reports] = await Promise.all([
    supabase.from("risk_zones").select("*"),
    supabase
      .from("reports")
      .select("id, hazard, neighborhood, description, severity, lat, lng, occurred_at")
      .eq("status", "aprovado")
      .not("lat", "is", null),
  ]);
  if (zones.error) throw zones.error;
  if (reports.error) throw reports.error;
  return { zones: zones.data ?? [], reports: reports.data ?? [] };
};

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string,
  );

const RiskMapView = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const { data } = useQuery({ queryKey: ["map-data"], queryFn: fetchMapData });

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    const map = L.map(mapRef.current, { scrollWheelZoom: false }).setView(
      [-23.6050, -45.4200],
      12,
    );
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapInstance.current = map;
    return () => {
      map.remove();
      mapInstance.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer || !data) return;
    layer.clearLayers();

    data.zones.forEach((zone) => {
      const color = HAZARD_COLORS[zone.hazard] ?? "#607D8B";
      L.circle([zone.lat, zone.lng], {
        radius: zone.radius_m,
        color,
        weight: 1.5,
        fillColor: color,
        fillOpacity: 0.15,
      }).addTo(layer);

      const icon = L.divIcon({
        className: "custom-marker",
        html: `<div style="width:28px;height:28px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center"><span style="font-size:14px">${HAZARD_EMOJI[zone.hazard] ?? "⚠️"}</span></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      L.marker([zone.lat, zone.lng], { icon }).addTo(layer).bindPopup(`
        <div style="font-family:'Plus Jakarta Sans',sans-serif;min-width:210px">
          <h3 style="font-weight:700;font-size:14px;margin:0 0 4px">${esc(zone.name)}</h3>
          <span style="display:inline-block;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600;color:white;background:${color};margin-bottom:6px">
            ${HAZARD_LABEL[zone.hazard] ?? "Risco"} • ${esc(zone.risk_level)}
          </span>
          <p style="font-size:13px;color:#555;margin:0 0 4px;line-height:1.4">${esc(zone.description ?? "")}</p>
          <p style="font-size:11px;color:#888;margin:0">Fonte: ${zone.source === "morador" ? "relato de morador" : "estudo técnico / Defesa Civil"}</p>
        </div>`);
    });

    data.reports.forEach((r) => {
      if (r.lat == null || r.lng == null) return;
      const color = HAZARD_COLORS[r.hazard] ?? "#607D8B";
      const icon = L.divIcon({
        className: "custom-marker",
        html: `<div style="width:22px;height:22px;border-radius:50%;background:white;border:3px solid ${color};box-shadow:0 2px 6px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center"><span style="font-size:11px">👤</span></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      L.marker([r.lat, r.lng], { icon }).addTo(layer).bindPopup(`
        <div style="font-family:'Plus Jakarta Sans',sans-serif;min-width:200px">
          <span style="display:inline-block;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600;color:white;background:${color};margin-bottom:6px">
            Relato de morador • ${HAZARD_LABEL[r.hazard] ?? ""}
          </span>
          <h3 style="font-weight:700;font-size:13px;margin:0 0 4px">${esc(r.neighborhood)}</h3>
          <p style="font-size:13px;color:#555;margin:0;line-height:1.4">${esc(r.description)}</p>
        </div>`);
    });
  }, [data]);

  return (
    <section id="mapa" className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "300px" }}
          className="text-center mb-12"
        >
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Mapa de Áreas de Risco
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Construído a partir de estudos técnicos da Defesa Civil e da experiência de
            quem mora na cidade. Descubra os riscos do seu bairro ou do lugar onde vai
            se hospedar.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-6 mb-8">
          <div className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-alert-flood" />
            <span className="text-sm font-medium text-foreground">Alagamento</span>
          </div>
          <div className="flex items-center gap-2">
            <Mountain className="h-5 w-5 text-alert-landslide" />
            <span className="text-sm font-medium text-foreground">Deslizamento</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-foreground">Relato de morador</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              Clique nos marcadores para detalhes
            </span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "300px" }}
          className="rounded-xl overflow-hidden shadow-elevated border border-border"
        >
          <div ref={mapRef} className="w-full h-[500px] sm:h-[600px]" />
        </motion.div>
      </div>
    </section>
  );
};

export default RiskMapView;
