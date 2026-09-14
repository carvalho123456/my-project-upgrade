import { motion } from "framer-motion";
import { Link } from "@/lib/router-compat";
import { Thermometer, Droplets, Wind, Umbrella, Sunrise, Sunset, CalendarDays, ArrowRight } from "lucide-react";
import { useForecast } from "@/hooks/useForecast";
import { codeLabel, formatDay, formatHour } from "@/lib/weather";

const Loading = () => (
  <div className="grid gap-4 lg:grid-cols-2">
    <div className="h-64 rounded-xl bg-muted animate-pulse lg:row-span-2" />
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
      ))}
    </div>
  </div>
);

const ForecastSection = () => {
  const { data, isLoading, isError } = useForecast();

  return (
    <section id="previsao" className="py-12 bg-secondary/40">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "300px" }}
          className="mb-10 text-center"
        >
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Previsão do Tempo
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Condições agora, hora a hora e para os próximos 7 dias em Caraguatatuba —
            para você se planejar no dia a dia.
          </p>
        </motion.div>

        {isLoading && <Loading />}
        {isError && (
          <p className="text-center text-muted-foreground">
            Não foi possível carregar a previsão agora. Tente novamente mais tarde.
          </p>
        )}

        {data && (
          <>
            {/* Leitura instantânea */}
            <div className="grid gap-4 lg:grid-cols-2 mb-10">
              <div className="rounded-xl bg-hero p-6 text-primary-foreground shadow-elevated lg:row-span-2 flex flex-col justify-center">
                <p className="text-sm opacity-80 mb-1">Agora em Caraguatatuba</p>
                <div className="flex items-end gap-3">
                  <span className="font-heading text-5xl font-bold">
                    {Math.round(data.current.temperature)}°
                  </span>
                  <span className="pb-2 text-lg opacity-90">{codeLabel(data.current.code)}</span>
                </div>
                <p className="mt-2 text-sm opacity-80">
                  Sensação de {Math.round(data.current.apparent)}° • Chuva agora{" "}
                  {Number(data.current.precipitation ?? 0).toFixed(1)} mm
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { Icon: Droplets, label: "Umidade", value: `${data.current.humidity}%` },
                  { Icon: Wind, label: "Vento", value: `${Math.round(data.current.wind)} km/h` },
                  {
                    Icon: Umbrella,
                    label: "Chuva 24h",
                    value: `${Number(data.rain24h ?? 0).toFixed(1)} mm`,
                  },
                  {
                    Icon: Thermometer,
                    label: "Máx / Mín hoje",
                    value: `${Math.round(data.daily.tempMax[0])}° / ${Math.round(data.daily.tempMin[0])}°`,
                  },
                ].map(({ Icon, label, value }) => (
                  <div key={label} className="rounded-xl bg-card p-5 shadow-card border border-border">
                    <Icon className="h-5 w-5 text-primary mb-2" />
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="font-heading text-xl font-bold text-foreground">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Próximas 24h */}
            <div className="mb-10">
              <h3 className="font-heading font-bold text-foreground mb-3">Próximas 24 horas</h3>
              <div className="flex gap-3 overflow-x-auto pb-3">
                {data.hourly.time.map((t, i) => (
                  <div
                    key={t}
                    className="min-w-[86px] rounded-xl bg-card border border-border p-3 text-center shadow-card"
                  >
                    <p className="text-xs text-muted-foreground">{formatHour(t)}</p>
                    <p className="font-heading text-lg font-bold text-foreground">
                      {Math.round(data.hourly.temperature[i])}°
                    </p>
                    <p className="text-xs text-alert-flood font-medium">
                      {data.hourly.precipitationProbability[i]}%
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 7 dias */}
            <div>
              <h3 className="font-heading font-bold text-foreground mb-1">Próximos 7 dias</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Clique em um dia para ver a previsão completa hora a hora.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {data.daily.date.slice(0, 7).map((d, i) => (
                  <Link
                    to={`/dia/${d}`}
                    key={d}
                    className="group rounded-xl border border-forecast-border bg-forecast-panel p-4 text-forecast-foreground shadow-card flex min-h-24 items-center justify-between transition-all hover:border-forecast-accent hover:-translate-y-0.5"
                  >
                    <div>
                      <p className="font-forecast-heading font-bold text-forecast-foreground">
                        {i === 0 ? "Hoje" : formatDay(d)}
                      </p>
                      <p className="text-xs text-forecast-muted">{codeLabel(data.daily.codes[i])}</p>
                      <p className="text-xs text-forecast-accent mt-1">
                        {data.daily.rainProb[i] ?? 0}% • {Number(data.daily.rainSum[i] ?? 0).toFixed(1)} mm
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-forecast-heading text-lg font-bold text-forecast-foreground">
                        {Math.round(data.daily.tempMax[i])}°
                      </p>
                      <p className="text-sm text-forecast-muted">
                        {Math.round(data.daily.tempMin[i])}°
                      </p>
                    </div>
                  </Link>
                ))}
                <Link
                  to="/previsao"
                  className="group rounded-xl border border-forecast-border bg-forecast-panel p-4 text-forecast-foreground shadow-card flex min-h-24 items-center justify-between transition-all hover:border-forecast-accent hover:-translate-y-0.5"
                >
                  <div>
                    <CalendarDays className="mb-2 h-5 w-5 text-forecast-accent" />
                    <p className="font-forecast-heading font-bold">Mais dias</p>
                    <p className="text-xs text-forecast-muted">Veja previsões e dias passados</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-forecast-accent transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
              <div className="mt-4 flex flex-wrap gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Sunrise className="h-4 w-4 text-alert-warning" /> Nascer do sol:{" "}
                  {formatHour(data.daily.sunrise[0])}
                </span>
                <span className="flex items-center gap-2">
                  <Sunset className="h-4 w-4 text-alert-landslide" /> Pôr do sol:{" "}
                  {formatHour(data.daily.sunset[0])}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default ForecastSection;
