import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Thermometer,
  CloudRain,
  Wind,
  Droplets,
  LineChart,
  LayoutList,
  Sun,
  Moon,
  Cloud,
  CloudSun,
  CloudDrizzle,
  CloudSnow,
  CloudLightning,
  CloudFog,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useForecast } from "@/hooks/useForecast";
import { formatHour } from "@/lib/weather";
import { cn } from "@/lib/utils";

type MetricKey = "temp" | "rain" | "wind" | "humidity";

const METRICS: {
  key: MetricKey;
  label: string;
  Icon: typeof Thermometer;
  unit: string;
  color: string;
}[] = [
  { key: "temp", label: "Temperatura", Icon: Thermometer, unit: "°C", color: "hsl(var(--alert-landslide))" },
  { key: "rain", label: "Chuva", Icon: CloudRain, unit: "mm", color: "hsl(var(--alert-flood))" },
  { key: "wind", label: "Vento", Icon: Wind, unit: "km/h", color: "hsl(var(--safe))" },
  { key: "humidity", label: "Umidade", Icon: Droplets, unit: "%", color: "hsl(var(--primary))" },
];

interface Props {
  /** Data ISO (YYYY-MM-DD) para mostrar as 24h daquele dia. Sem isso, mostra as próximas 24h. */
  dayIso?: string;
  /** Renderiza apenas o cartão do gráfico, sem título de seção */
  bare?: boolean;
}

const HourlyCharts = ({ dayIso, bare = false }: Props) => {
  const { data, isLoading } = useForecast();
  const [metric, setMetric] = useState<MetricKey>("temp");

  const active = METRICS.find((m) => m.key === metric)!;
  const chartRef = useRef<HTMLDivElement>(null);

  const source = (() => {
    if (!data) return null;
    if (!dayIso) return data.hourly;
    const all = data.hourlyAll;
    const idx = all.time
      .map((t, i) => ({ t, i }))
      .filter(({ t }) => t.slice(0, 10) === dayIso)
      .map(({ i }) => i);
    return {
      time: idx.map((i) => all.time[i]),
      temperature: idx.map((i) => all.temperature[i]),
      precipitationProbability: idx.map((i) => all.precipitationProbability[i]),
      precipitation: idx.map((i) => all.precipitation[i]),
      code: idx.map((i) => all.code[i]),
      wind: idx.map((i) => all.wind[i]),
      humidity: idx.map((i) => all.humidity[i]),
    };
  })();

  const chartData =
    source?.time.map((t, i) => ({
      hora: formatHour(t),
      temp: Math.round(source.temperature[i]),
      rain: source.precipitation[i] ?? 0,
      wind: Math.round(source.wind[i]),
      humidity: source.humidity?.[i] ?? 0,
    })) ?? [];

  const ActiveDot = ({ cx, cy, payload, value }: { cx?: number; cy?: number; payload?: { hora: string }; value?: number }) => {
    if (cx == null || cy == null || value == null) return null;
    const boxW = 90;
    const boxH = 50;
    const chartW = chartRef.current?.clientWidth ?? 600;
    const chartH = chartRef.current?.clientHeight ?? 288;
    const x = Math.min(Math.max(cx - boxW / 2, 4), Math.max(chartW - boxW - 4, 4));
    const above = cy - (boxH + 8) >= 0;
    const y = above ? cy - (boxH + 8) : Math.min(cy + 12, chartH - boxH - 4);
    return (
      <g>
        <circle cx={cx} cy={cy} r={5} fill="hsl(var(--background))" stroke={active.color} strokeWidth={2.5} />
        <foreignObject x={x} y={y} width={boxW} height={boxH}>
          <div className="flex flex-col items-center justify-center rounded-xl bg-popover/95 backdrop-blur-sm border border-border px-2.5 py-1.5 shadow-lg">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground leading-none mb-1">{payload?.hora}</p>
            <p className="text-sm font-semibold text-popover-foreground leading-none">
              {value}
              {active.unit}
            </p>
          </div>
        </foreignObject>
      </g>
    );
  };

  const card = (
    <div className="rounded-2xl bg-card border border-border shadow-card p-4 sm:p-6 h-full flex flex-col">
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {METRICS.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setMetric(key)}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors border",
              metric === key
                ? "bg-primary text-primary-foreground border-primary shadow-card"
                : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex-1 min-h-[18rem] rounded-xl bg-muted animate-pulse" />
      ) : (
        <div className="flex-1 min-h-[18rem] w-full cursor-pointer [&_*]:cursor-pointer" ref={chartRef}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 12, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="metricFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={active.color} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={active.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="hora"
                interval={2}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                width={44}
                unit={active.unit}
              />
              <Tooltip
                isAnimationActive={false}
                animationDuration={0}
                cursor={{ stroke: "hsl(var(--border))" }}
                content={() => null}
              />
              <Area
                isAnimationActive={false}
                type="monotone"
                dataKey={metric}
                stroke={active.color}
                strokeWidth={2.5}
                fill="url(#metricFill)"
                dot={false}
                activeDot={<ActiveDot />}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );

  if (bare) return card;

  return (
    <section id="graficos" className="py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "300px" }}
          className="mb-8 text-center"
        >
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Gráficos hora a hora
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Veja a variação de temperatura, chuva, vento e umidade nas próximas 24 horas.
          </p>
        </motion.div>
        {card}
      </div>
    </section>
  );
};

export default HourlyCharts;
