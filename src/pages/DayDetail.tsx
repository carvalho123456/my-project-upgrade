import { Link } from "@/lib/router-compat";
import { useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Sunrise,
  Sunset,
  Thermometer,
  ThermometerSnowflake,
  CloudRain,
  Wind,
  Droplets,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import HourlyCharts from "@/components/HourlyCharts";
import { MoonCalendarCard } from "@/components/MoonSection";
import { useForecast } from "@/hooks/useForecast";
import { codeLabel, formatHour } from "@/lib/weather";

const longDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

const SunArc = ({ sunrise, sunset }: { sunrise: string; sunset: string }) => {
  const rise = new Date(sunrise);
  const set = new Date(sunset);
  const durationMin = (set.getTime() - rise.getTime()) / 60000;
  const h = Math.floor(durationMin / 60);
  const m = Math.round(durationMin % 60);
  const now = new Date();
  const t = Math.min(Math.max((now.getTime() - rise.getTime()) / (set.getTime() - rise.getTime()), 0), 1);
  const x = 20 + t * 260;
  const y = 90 - Math.sin(t * Math.PI) * 62;

  return (
    <div className="rounded-2xl bg-card border border-border shadow-card p-5">
      <p className="font-heading font-bold text-foreground mb-4">Nascer e Pôr do Sol</p>
      <svg viewBox="0 0 300 110" className="w-full h-32">
        <path d="M 20 90 Q 150 -20 280 90" fill="none" stroke="hsl(var(--border))" strokeWidth="2" />
        <line x1="10" y1="90" x2="290" y2="90" stroke="hsl(var(--border))" strokeWidth="1" />
        <circle cx={x} cy={y} r="7" fill="hsl(var(--alert-warning))" />
      </svg>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Sunrise className="h-4 w-4 text-alert-warning" />
          <div>
            <p className="text-xs text-muted-foreground">Nascer do sol</p>
            <p className="font-heading font-bold text-foreground">{formatHour(sunrise)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Sunset className="h-4 w-4 text-alert-landslide" />
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Pôr do sol</p>
            <p className="font-heading font-bold text-foreground">{formatHour(sunset)}</p>
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        Duração do dia <span className="font-medium text-foreground">{h}h{String(m).padStart(2, "0")}m</span>
      </p>
    </div>
  );
};

const DayDetail = () => {
  const { date = "" } = useParams({ strict: false }) as { date?: string };
  const { data, isLoading } = useForecast();

  const idx = data?.daily.date.findIndex((d) => d === date) ?? -1;
  const valid = data && idx >= 0;

  const hoursIdx =
    data?.hourlyAll.time.map((t, i) => ({ t, i })).filter(({ t }) => t.slice(0, 10) === date).map(({ i }) => i) ?? [];
  const windMax = hoursIdx.reduce((a, i) => Math.max(a, data!.hourlyAll.wind[i] ?? 0), 0);
  const humMax = hoursIdx.reduce((a, i) => Math.max(a, data!.hourlyAll.humidity[i] ?? 0), 0);

  const nextIdx = valid && idx + 1 < data!.daily.date.length ? idx + 1 : -1;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-28 pb-16">
        <Link
          to="/#previsao"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para a previsão
        </Link>

        {isLoading && <div className="h-64 rounded-2xl bg-muted animate-pulse" />}
        {!isLoading && !valid && (
          <p className="text-muted-foreground">Não encontramos a previsão para esse dia.</p>
        )}

        {valid && (
          <>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-1 capitalize">
              {longDate(date)}
            </h1>
            <p className="text-muted-foreground mb-8">Previsão detalhada em Caraguatatuba</p>

            <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr] items-stretch mb-6">
              <div className="rounded-2xl bg-hero p-7 text-primary-foreground shadow-elevated flex flex-col justify-center">
                <p className="text-sm opacity-80 mb-1 capitalize">{longDate(date)}</p>
                <div className="flex items-end gap-3">
                  <span className="font-heading text-6xl font-bold">
                    {Math.round(data!.daily.tempMax[idx])}°
                  </span>
                  <span className="pb-3 text-xl opacity-80">
                    {Math.round(data!.daily.tempMin[idx])}°
                  </span>
                </div>
                <p className="mt-2 text-lg opacity-90">{codeLabel(data!.daily.codes[idx])}</p>
                <p className="mt-1 text-sm opacity-80">
                  Chuva {data!.daily.rainSum[idx].toFixed(1)} mm • {data!.daily.rainProb[idx]}% de chance
                </p>
              </div>

              <div className="rounded-2xl bg-card border border-border shadow-card p-5">
                <p className="font-heading font-bold text-foreground mb-4">Comparativo</p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-muted-foreground">
                      <th className="text-left font-medium pb-2">Dado</th>
                      <th className="text-right font-medium pb-2">Este dia</th>
                      {nextIdx >= 0 && <th className="text-right font-medium pb-2">Dia seguinte</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        Icon: Thermometer,
                        label: "Temperatura máxima",
                        a: `${Math.round(data!.daily.tempMax[idx])}°`,
                        b: nextIdx >= 0 ? `${Math.round(data!.daily.tempMax[nextIdx])}°` : "",
                      },
                      {
                        Icon: ThermometerSnowflake,
                        label: "Temperatura mínima",
                        a: `${Math.round(data!.daily.tempMin[idx])}°`,
                        b: nextIdx >= 0 ? `${Math.round(data!.daily.tempMin[nextIdx])}°` : "",
                      },
                      {
                        Icon: CloudRain,
                        label: "Chuva (mm)",
                        a: `${data!.daily.rainSum[idx].toFixed(1)}mm`,
                        b: nextIdx >= 0 ? `${data!.daily.rainSum[nextIdx].toFixed(1)}mm` : "",
                      },
                      {
                        Icon: Wind,
                        label: "Vento máximo (km/h)",
                        a: `${Math.round(windMax)}`,
                        b: "",
                      },
                      {
                        Icon: Droplets,
                        label: "Umidade máxima",
                        a: `${Math.round(humMax)}%`,
                        b: "",
                      },
                    ].map(({ Icon, label, a, b }) => (
                      <tr key={label} className="border-t border-border">
                        <td className="py-2.5 flex items-center gap-2 text-muted-foreground">
                          <Icon className="h-4 w-4 text-primary" /> {label}
                        </td>
                        <td className="py-2.5 text-right font-heading font-bold text-foreground">{a}</td>
                        {nextIdx >= 0 && (
                          <td className="py-2.5 text-right text-muted-foreground">{b || "—"}</td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr] items-stretch">
              <div className="flex flex-col">
                <h2 className="font-heading text-xl font-bold text-foreground mb-3">
                  Previsão hora a hora
                </h2>
                <div className="flex-1 flex">
                  <div className="w-full">
                    <HourlyCharts dayIso={date} bare />
                  </div>
                </div>
              </div>
              <div className="grid gap-5 content-start">
                <SunArc sunrise={data!.daily.sunrise[idx]} sunset={data!.daily.sunset[idx]} />
                <MoonCalendarCard compact />
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default DayDetail;
