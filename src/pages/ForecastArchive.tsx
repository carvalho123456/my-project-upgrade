import { useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, CloudRain, Sunrise, Sunset } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { Button } from "@/components/ui/button";
import { useForecast } from "@/hooks/useForecast";
import { Link } from "@/lib/router-compat";
import { codeLabel } from "@/lib/weather";

const WEEK = ["D", "S", "T", "Q", "Q", "S", "S"];

const toIso = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const fullDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

export default function ForecastArchive() {
  const { data, isLoading, isError } = useForecast();
  const todayIso = toIso(new Date());
  const initialDate = data?.dailyAll.date.find((date) => date === todayIso) ?? data?.dailyAll.date[0] ?? todayIso;
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const selected = data?.dailyAll.date.includes(selectedDate) ? selectedDate : initialDate;
  const selectedDateValue = new Date(`${selected}T12:00:00`);
  const [monthOffset, setMonthOffset] = useState(0);

  const visibleMonth = useMemo(
    () => new Date(selectedDateValue.getFullYear(), selectedDateValue.getMonth() + monthOffset, 1),
    [selectedDateValue.getFullYear(), selectedDateValue.getMonth(), monthOffset],
  );
  const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
  const offset = visibleMonth.getDay();
  const available = new Set(data?.dailyAll.date ?? []);
  const selectedIndex = data?.dailyAll.date.indexOf(selected) ?? -1;

  // Lista resumida: 3 dias anteriores, hoje e os 6 dias seguintes.
  const wanted = new Set<string>();
  const todayMs = new Date(`${todayIso}T12:00:00`).getTime();
  for (let offset = -3; offset <= 6; offset++) {
    wanted.add(toIso(new Date(todayMs + offset * 86400000)));
  }
  const visibleDays = useMemo(
    () =>
      (data?.dailyAll.date ?? [])
        .map((date, index) => ({ date, index }))
        .filter(({ date }) => wanted.has(date)),
    [data?.dailyAll.date],
  );

  const chooseDate = (iso: string) => {
    setSelectedDate(iso);
    setMonthOffset(0);
  };

  return (
    <div className="min-h-screen bg-forecast-background font-forecast-body text-forecast-foreground">
      <Header />
      <main className="container mx-auto px-4 pb-16 pt-28">
        <Link to="/#previsao" className="mb-7 inline-flex items-center gap-2 text-sm text-forecast-muted transition-colors hover:text-forecast-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar para a previsão
        </Link>

        <div className="mb-8">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-forecast-accent">
            <CalendarDays className="h-4 w-4" /> Histórico e previsão
          </p>
          <h1 className="font-forecast-heading text-3xl font-bold sm:text-4xl">Previsão por dia</h1>
          <p className="mt-2 max-w-2xl text-forecast-muted">Consulte os últimos 14 dias e a previsão disponível para as próximas duas semanas em Caraguatatuba.</p>
        </div>

        {isLoading && <div className="h-96 animate-pulse rounded-lg bg-forecast-panel" />}
        {isError && <p className="text-forecast-muted">Não foi possível carregar os dados agora.</p>}

        {data && selectedIndex >= 0 && (
          <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="h-fit rounded-lg border border-forecast-border bg-forecast-panel p-5 lg:sticky lg:top-24">
              <div className="mb-5 flex items-center justify-between">
                <p className="font-forecast-heading font-semibold capitalize">
                  {visibleMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                </p>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => setMonthOffset((value) => value - 1)} aria-label="Mês anterior" className="text-forecast-muted hover:bg-forecast-background hover:text-forecast-foreground">
                    <ChevronLeft />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setMonthOffset((value) => value + 1)} aria-label="Próximo mês" className="text-forecast-muted hover:bg-forecast-background hover:text-forecast-foreground">
                    <ChevronRight />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {WEEK.map((day, index) => <span key={`${day}-${index}`} className="pb-2 text-xs font-semibold text-forecast-muted">{day}</span>)}
                {Array.from({ length: offset }).map((_, index) => <span key={`empty-${index}`} />)}
                {Array.from({ length: daysInMonth }).map((_, index) => {
                  const date = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), index + 1);
                  const iso = toIso(date);
                  const enabled = available.has(iso);
                  const active = iso === selected;
                  return (
                    <Button
                      key={iso}
                      variant="ghost"
                      size="icon"
                      disabled={!enabled}
                      onClick={() => chooseDate(iso)}
                      aria-label={date.toLocaleDateString("pt-BR")}
                      className={active ? "bg-forecast-accent text-forecast-foreground hover:bg-forecast-accent" : "text-forecast-foreground hover:bg-forecast-background disabled:text-forecast-muted/30"}
                    >
                      {index + 1}
                    </Button>
                  );
                })}
              </div>
              <div className="mt-5 border-t border-forecast-border pt-4 text-xs text-forecast-muted">
                Datas apagadas ainda não possuem dados disponíveis.
              </div>
            </aside>

            <section>
              <div className="mb-4 rounded-lg border border-forecast-accent/40 bg-forecast-panel p-6">
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                  <div>
                    <span className="text-xs font-bold uppercase text-forecast-accent">{selected < todayIso ? "Dia passado" : selected === todayIso ? "Hoje" : "Previsão"}</span>
                    <h2 className="mt-1 font-forecast-heading text-2xl font-bold capitalize">{fullDate(selected)}</h2>
                    <p className="mt-1 text-forecast-muted">{codeLabel(data.dailyAll.codes[selectedIndex])}</p>
                  </div>
                  <div className="flex items-end gap-3">
                    <strong className="font-forecast-heading text-5xl">{Math.round(data.dailyAll.tempMax[selectedIndex])}°</strong>
                    <span className="pb-1 text-xl text-forecast-muted">{Math.round(data.dailyAll.tempMin[selectedIndex])}°</span>
                  </div>
                </div>
                <div className="mt-6 grid gap-3 border-t border-forecast-border pt-5 sm:grid-cols-3">
                  <span className="flex items-center gap-2 text-sm"><CloudRain className="h-4 w-4 text-forecast-accent" /> {data.dailyAll.rainProb[selectedIndex] ?? 0}% • {Number(data.dailyAll.rainSum[selectedIndex] ?? 0).toFixed(1)} mm</span>
                  <span className="flex items-center gap-2 text-sm text-forecast-muted"><Sunrise className="h-4 w-4" /> {data.dailyAll.sunrise[selectedIndex].slice(11, 16)}</span>
                  <span className="flex items-center gap-2 text-sm text-forecast-muted"><Sunset className="h-4 w-4" /> {data.dailyAll.sunset[selectedIndex].slice(11, 16)}</span>
                </div>
                <Link to={`/dia/${selected}`} className="mt-5 inline-flex items-center text-sm font-semibold text-forecast-accent hover:underline">Ver detalhes hora a hora</Link>
              </div>

              <h2 className="mb-3 font-forecast-heading text-lg font-bold">Todos os dias disponíveis</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {data.dailyAll.date.map((date, index) => (
                  <button
                    type="button"
                    key={date}
                    onClick={() => chooseDate(date)}
                    className={`flex min-h-24 items-center justify-between rounded-lg border p-4 text-left transition-all ${date === selected ? "border-forecast-accent bg-forecast-panel" : "border-forecast-border bg-forecast-panel/70 hover:border-forecast-accent/60"}`}
                  >
                    <span>
                      <span className="block font-forecast-heading font-semibold capitalize">{fullDate(date)}</span>
                      <span className="block text-xs text-forecast-muted">{codeLabel(data.dailyAll.codes[index])}</span>
                      <span className="mt-1 block text-xs text-forecast-accent">{data.dailyAll.rainProb[index] ?? 0}% • {Number(data.dailyAll.rainSum[index] ?? 0).toFixed(1)} mm</span>
                    </span>
                    <span className="text-right">
                      <strong className="block font-forecast-heading text-xl">{Math.round(data.dailyAll.tempMax[index])}°</strong>
                      <span className="text-sm text-forecast-muted">{Math.round(data.dailyAll.tempMin[index])}°</span>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}