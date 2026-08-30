import { useState } from "react";
import { motion } from "framer-motion";
import { NavLink } from "@/lib/router-compat";
import { Moon, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  moonPhase,
  moonIllumination,
  phaseName,
  nextPhaseDate,
  formatPhaseDate,
} from "@/lib/moon";

/** Desenha a lua com a parte iluminada correta (orientação do Hemisfério Sul) */
export const MoonDisc = ({ date, size = 160 }: { date: Date; size?: number }) => {
  const p = moonPhase(date);
  const r = size / 2 - 2;
  const illum = moonIllumination(date);
  const rx = r * Math.abs(Math.cos(2 * Math.PI * p));
  const waxing = p < 0.5;
  const bulge = illum > 0.5 ? 1 : 0;

  const litPath = waxing
    ? `M 0,${-r} A ${r},${r} 0 0,0 0,${r} A ${rx},${r} 0 0,${bulge ? 0 : 1} 0,${-r} Z`
    : `M 0,${-r} A ${r},${r} 0 0,1 0,${r} A ${rx},${r} 0 0,${bulge ? 1 : 0} 0,${-r} Z`;

  return (
    <svg width={size} height={size} viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`}>
      <defs>
        <radialGradient id="moonLit" cx="35%" cy="30%">
          <stop offset="0%" stopColor="hsl(var(--ocean-pale))" />
          <stop offset="100%" stopColor="hsl(var(--sky))" />
        </radialGradient>
      </defs>
      <circle r={r} fill="hsl(var(--foreground) / 0.12)" />
      {illum > 0.005 && <path d={litPath} fill="url(#moonLit)" />}
      <circle r={r} fill="none" stroke="hsl(var(--border))" strokeWidth={1} />
      <circle cx={-r * 0.3} cy={-r * 0.2} r={r * 0.16} fill="hsl(var(--foreground) / 0.07)" />
      <circle cx={r * 0.25} cy={r * 0.3} r={r * 0.12} fill="hsl(var(--foreground) / 0.07)" />
      <circle cx={r * 0.05} cy={-r * 0.45} r={r * 0.09} fill="hsl(var(--foreground) / 0.06)" />
    </svg>
  );
};

const WEEK = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

/** Calendário lunar do mês corrente, em grade — usado na home e na tela do dia */
export const MoonCalendarCard = ({ compact = false }: { compact?: boolean }) => {
  const today = new Date();
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const { year, month } = view;
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerValue, setPickerValue] = useState("");

  const shiftMonth = (delta: number) =>
    setView((v) => {
      const d = new Date(v.year, v.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  const goToday = () => setView({ year: today.getFullYear(), month: today.getMonth() });
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  const applyPicker = () => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(pickerValue)) return;
    const d = new Date(`${pickerValue}T12:00:00`);
    if (isNaN(d.getTime())) return;
    setView({ year: d.getFullYear(), month: d.getMonth() });
    setPickerOpen(false);
  };
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // segunda = 0
  const offset = (first.getDay() + 6) % 7;
  const cells: (Date | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];

  const size = compact ? 26 : 32;

  return (
    <div className="rounded-2xl bg-card border border-border shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="font-heading font-bold text-foreground flex items-center gap-2">
          <Moon className="h-4 w-4 text-primary" /> Calendário Lunar
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            aria-label="Mês anterior"
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <p className="text-xs text-muted-foreground capitalize min-w-[110px] text-center">
            {new Date(year, month, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
          </p>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            aria-label="Próximo mês"
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEK.map((w) => (
          <p key={w} className="text-[11px] font-medium text-muted-foreground pb-1">
            {w}
          </p>
        ))}
        {cells.map((d, i) =>
          d ? (
            <NavLink
              key={i}
              to={`/lua/${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
                d.getDate(),
              ).padStart(2, "0")}`}
              className={`flex flex-col items-center rounded-lg py-1.5 transition-colors hover:bg-primary/10 ${
                d.toDateString() === today.toDateString()
                  ? "bg-primary/10 ring-1 ring-primary/40"
                  : ""
              }`}
              activeClassName="bg-accent/20 ring-1 ring-accent"
            >
              <MoonDisc date={d} size={size} />
              <span className="text-[11px] text-muted-foreground mt-0.5">{d.getDate()}</span>
            </NavLink>
          ) : (
            <div key={i} />
          ),
        )}
      </div>
    </div>
  );
};

const MoonSection = () => {
  const today = new Date();

  const upcoming = [
    { label: "Lua Nova", target: 0 },
    { label: "Quarto Crescente", target: 0.25 },
    { label: "Lua Cheia", target: 0.5 },
    { label: "Quarto Minguante", target: 0.75 },
  ]
    .map((f) => ({ ...f, date: nextPhaseDate(f.target, today) }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <section id="lua" className="py-12 bg-secondary/40">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "300px" }}
          className="mb-6 text-center"
        >
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Calendário Lunar
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Qual lua está no céu hoje em Caraguatatuba — e quando vêm as próximas fases.
          </p>
        </motion.div>

        <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr] items-start">
          <div className="rounded-2xl bg-card border border-border shadow-card p-6 flex flex-col items-center text-center">
            <MoonDisc date={today} size={150} />
            <p className="font-heading text-xl font-bold text-foreground mt-4">{phaseName(today)}</p>
            <p className="text-sm text-muted-foreground">
              {Math.round(moonIllumination(today) * 100)}% iluminada · hoje
            </p>

            <div className="mt-5 w-full grid gap-3 border-t border-border pt-5 text-left">
              {upcoming.map((f) => (
                <div key={f.label} className="flex items-center gap-3">
                  <MoonDisc date={f.date} size={34} />
                  <div>
                    <p className="font-heading text-sm font-bold text-foreground">{f.label}</p>
                    <p className="text-xs text-muted-foreground">{formatPhaseDate(f.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <MoonCalendarCard />
        </div>
      </div>
    </section>
  );
};

export default MoonSection;
