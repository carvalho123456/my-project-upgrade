import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  Droplets,
  Info,
  Sun,
  Thermometer,
  Umbrella,
  Wind,
} from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";
import { Button } from "@/components/ui/button";
import { useForecast } from "@/hooks/useForecast";
import { codeLabel } from "@/lib/weather";
import { cn } from "@/lib/utils";

type Period = 7 | 14;

const weatherIcon = (code: number) => {
  if (code === 0) return Sun;
  if (code <= 2) return CloudSun;
  if (code === 3) return Cloud;
  if (code <= 48) return CloudFog;
  if (code <= 57) return CloudDrizzle;
  if (code <= 82) return CloudRain;
  return CloudLightning;
};

const shortDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });

const weekday = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");

const longDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

const NextDays = () => {
  const { data, isLoading, isError } = useForecast();
  const [period, setPeriod] = useState<Period>(7);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    if (!selectedDate && data?.daily.date[0]) setSelectedDate(data.daily.date[0]);
  }, [data, selectedDate]);

  const visibleDates = useMemo(() => data?.daily.date.slice(0, period) ?? [], [data, period]);
  const selectedIndex = data?.daily.date.indexOf(selectedDate) ?? -1;
  const safeIndex = selectedIndex >= 0 ? selectedIndex : 0;
  const selected = Boolean(data?.daily.date[safeIndex]);

  const selectRelative = (direction: -1 | 1) => {
    if (!data) return;
    const next = Math.min(Math.max(safeIndex + direction, 0), data.daily.date.length - 1);
    const date = data.daily.date[next];
    if (date) setSelectedDate(date);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pb-16 pt-28">
        <Link
          to="/"
          hash="previsao"
          className="mb-7 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para a previsão
        </Link>

        <header className="mb-8 text-center">
          <p className="mb-2 text-sm font-semibold uppercase text-primary">Planeje sua semana</p>
          <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">Próximos dias</h1>
          <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
            Consulte a previsão estendida para Caraguatatuba e navegue entre os dias disponíveis.
          </p>
        </header>

        <section className="mb-6 border-y border-border bg-card px-4 py-5 shadow-card sm:rounded-lg sm:border">
          <div className="grid items-end gap-5 lg:grid-cols-[1fr_1px_1.35fr]">
            <div>
              <p className="mb-3 text-sm font-semibold text-foreground">Escolha o período</p>
              <div className="flex flex-wrap gap-2">
                {([7, 14] as const).map((days) => (
                  <Button
                    key={days}
                    type="button"
                    variant={period === days ? "default" : "outline"}
                    onClick={() => setPeriod(days)}
                  >
                    <CalendarDays /> {days} dias
                  </Button>
                ))}
              </div>
            </div>
            <div className="hidden h-full bg-border lg:block" />
            <div>
              <label htmlFor="forecast-date" className="mb-3 block text-sm font-semibold text-foreground">
                Selecione uma data
              </label>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="icon" onClick={() => selectRelative(-1)} aria-label="Dia anterior">
                  <ChevronLeft />
                </Button>
                <input
                  id="forecast-date"
                  type="date"
                  value={selectedDate}
                  min={data?.daily.date[0]}
                  max={data?.daily.date[data.daily.date.length - 1]}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  className="h-10 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                />
                <Button type="button" variant="outline" size="icon" onClick={() => selectRelative(1)} aria-label="Próximo dia">
                  <ChevronRight />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {isLoading && <div className="h-80 animate-pulse rounded-lg bg-muted" />}
        {isError && <p className="py-16 text-center text-muted-foreground">Não foi possível carregar a previsão agora.</p>}

        {data && selected && (
          <>
            <div className="mb-6 grid gap-5 lg:grid-cols-[0.82fr_1.7fr]">
              <article className="flex min-h-72 flex-col justify-between rounded-lg bg-hero p-6 text-primary-foreground shadow-elevated">
                <div>
                  <p className="text-sm capitalize opacity-80">{longDate(data.daily.date[safeIndex])}</p>
                  <p className="mt-1 text-sm opacity-80">Caraguatatuba, SP</p>
                </div>
                <div className="my-6 flex items-center gap-5">
                  {(() => {
                    const Icon = weatherIcon(data.daily.codes[safeIndex]);
                    return <Icon className="h-16 w-16 text-sky" />;
                  })()}
                  <div>
                    <p className="font-heading text-6xl font-bold">{Math.round(data.daily.tempMax[safeIndex])}°</p>
                    <p className="mt-1 font-medium">{codeLabel(data.daily.codes[safeIndex])}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 border-t border-primary-foreground/20 pt-4 text-sm">
                  <div><p className="opacity-70">Mínima</p><p className="font-bold">{Math.round(data.daily.tempMin[safeIndex])}°</p></div>
                  <div><p className="opacity-70">Chuva</p><p className="font-bold">{data.daily.rainSum[safeIndex].toFixed(1)} mm</p></div>
                  <div><p className="opacity-70">Chance</p><p className="font-bold">{data.daily.rainProb[safeIndex]}%</p></div>
                </div>
              </article>

              <section className="rounded-lg border border-border bg-card p-5 shadow-card">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-heading text-lg font-bold text-foreground">Navegue pelos próximos dias</h2>
                    <p className="text-sm text-muted-foreground">Selecione um dia para atualizar o resumo.</p>
                  </div>
                  <span className="rounded-md bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground">
                    {visibleDates.length} dias disponíveis
                  </span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-3">
                  {visibleDates.map((date, index) => {
                    const dataIndex = data.daily.date.indexOf(date);
                    const Icon = weatherIcon(data.daily.codes[dataIndex]);
                    const active = date === data.daily.date[safeIndex];
                    return (
                      <button
                        type="button"
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={cn(
                          "min-w-28 rounded-lg border p-3 text-center transition-all",
                          active
                            ? "border-primary bg-primary/10 shadow-card"
                            : "border-border bg-background hover:border-primary/50",
                        )}
                      >
                        <p className="text-xs text-muted-foreground">{index === 0 ? "Hoje" : shortDate(date)}</p>
                        <p className="mt-1 font-heading text-sm font-bold capitalize text-foreground">{weekday(date)}</p>
                        <Icon className={cn("mx-auto my-3 h-8 w-8", active ? "text-primary" : "text-muted-foreground")} />
                        <p className="font-heading font-bold text-foreground">{Math.round(data.daily.tempMax[dataIndex])}°</p>
                        <p className="text-xs text-primary">{Math.round(data.daily.tempMin[dataIndex])}°</p>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-3">
                  <div className="flex items-center gap-3"><Thermometer className="text-alert-landslide" /><div><p className="text-xs text-muted-foreground">Amplitude</p><p className="font-bold text-foreground">{Math.round(data.daily.tempMax[safeIndex] - data.daily.tempMin[safeIndex])}°C</p></div></div>
                  <div className="flex items-center gap-3"><Umbrella className="text-alert-flood" /><div><p className="text-xs text-muted-foreground">Probabilidade</p><p className="font-bold text-foreground">{data.daily.rainProb[safeIndex]}%</p></div></div>
                  <div className="flex items-center gap-3"><Droplets className="text-primary" /><div><p className="text-xs text-muted-foreground">Acumulado</p><p className="font-bold text-foreground">{data.daily.rainSum[safeIndex].toFixed(1)} mm</p></div></div>
                </div>
              </section>
            </div>

            <div className="mb-6 flex flex-col gap-4 rounded-lg border border-border bg-secondary/40 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <p className="text-sm text-muted-foreground">Previsões mais distantes podem sofrer alterações. Consulte novamente antes de sair.</p>
              </div>
              <Button asChild>
                <Link to="/dia/$date" params={{ date: data.daily.date[safeIndex] }}>
                  Ver detalhes do dia <ChevronRight />
                </Link>
              </Button>
            </div>
          </>
        )}
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default NextDays;