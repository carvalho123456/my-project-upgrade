import { SEVERITIES, DISCLAIMER } from "@/lib/liveAlerts";

/** Legenda de cores do mapa colaborativo, sempre visível junto do mapa. */
const LiveAlertLegend = () => (
  <div className="rounded-xl border border-border bg-card p-4 shadow-card">
    <h3 className="font-heading text-sm font-bold text-foreground mb-3">
      Legenda de intensidade
    </h3>
    <ul className="grid gap-2 sm:grid-cols-2">
      {SEVERITIES.map((s) => (
        <li key={s.value} className="flex items-center gap-2 text-sm text-foreground">
          <span
            className="h-3.5 w-3.5 shrink-0 rounded-full border border-border"
            style={{ background: s.color }}
            aria-hidden
          />
          <span className="font-semibold">{s.label}</span>
          <span className="text-muted-foreground text-xs">— {s.note}</span>
        </li>
      ))}
    </ul>
    <p className="mt-3 text-xs text-muted-foreground leading-relaxed">{DISCLAIMER}</p>
  </div>
);

export default LiveAlertLegend;
