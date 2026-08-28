import { ALERT_KINDS, SEVERITIES } from "@/lib/liveAlerts";

export interface AlertFilters {
  kind: string;
  severity: string;
  hours: number;
  neighborhood: string;
}

export const DEFAULT_FILTERS: AlertFilters = {
  kind: "todos",
  severity: "todos",
  hours: 48,
  neighborhood: "",
};

interface Props {
  value: AlertFilters;
  onChange: (next: AlertFilters) => void;
}

const selectClass =
  "rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring";

const LiveAlertFilters = ({ value, onChange }: Props) => (
  <div className="flex flex-wrap items-center gap-2">
    <select
      aria-label="Filtrar por tipo de ocorrência"
      className={selectClass}
      value={value.kind}
      onChange={(e) => onChange({ ...value, kind: e.target.value })}
    >
      <option value="todos">Todos os tipos</option>
      {ALERT_KINDS.map((k) => (
        <option key={k.value} value={k.value}>
          {k.emoji} {k.label}
        </option>
      ))}
    </select>

    <select
      aria-label="Filtrar por nível de risco"
      className={selectClass}
      value={value.severity}
      onChange={(e) => onChange({ ...value, severity: e.target.value })}
    >
      <option value="todos">Todos os níveis</option>
      {SEVERITIES.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>

    <select
      aria-label="Filtrar por período"
      className={selectClass}
      value={value.hours}
      onChange={(e) => onChange({ ...value, hours: Number(e.target.value) })}
    >
      <option value={3}>Últimas 3 h</option>
      <option value={12}>Últimas 12 h</option>
      <option value={48}>Últimas 48 h</option>
      <option value={168}>Últimos 7 dias</option>
    </select>

    <input
      aria-label="Filtrar por bairro"
      className={`${selectClass} min-w-[10rem] flex-1`}
      placeholder="Bairro ou região"
      maxLength={80}
      value={value.neighborhood}
      onChange={(e) => onChange({ ...value, neighborhood: e.target.value })}
    />
  </div>
);

export default LiveAlertFilters;
