import { motion } from "framer-motion";
import { AlertTriangle, ShieldCheck, CloudRain, Siren } from "lucide-react";
import { useForecast } from "@/hooks/useForecast";
import { RISK_META } from "@/lib/weather";

const icons = {
  seguro: ShieldCheck,
  atencao: CloudRain,
  alerta: AlertTriangle,
  critico: Siren,
} as const;

const AlertBanner = () => {
  const { risk, data, isLoading } = useForecast();
  if (isLoading || !risk || !data) return null;

  const Icon = icons[risk.level];
  const tone = RISK_META[risk.level].tone;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      id="alertas"
      className="relative z-30 border-b border-border"
      style={{ background: `hsl(var(--${tone}) / 0.12)` }}
    >
      <div className="container mx-auto flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ background: `hsl(var(--${tone}) / 0.2)` }}
          >
            <Icon className="h-5 w-5" style={{ color: `hsl(var(--${tone}))` }} />
          </span>
          <div>
            <p className="text-sm font-bold text-foreground">
              {RISK_META[risk.level].label} • {risk.title}
            </p>
            <p className="text-xs text-muted-foreground">{risk.message}</p>
          </div>
        </div>
        <div className="sm:ml-auto flex gap-4 text-xs text-muted-foreground shrink-0">
          <span>
            Próx. 24h: <strong className="text-foreground">{data.rain24h.toFixed(1)} mm</strong>
          </span>
          <span>
            Últimos 3 dias: <strong className="text-foreground">{data.rainPast72h.toFixed(1)} mm</strong>
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default AlertBanner;
