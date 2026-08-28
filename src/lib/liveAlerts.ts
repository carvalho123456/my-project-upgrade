/**
 * Catálogo central do mapa colaborativo.
 *
 * Tudo que descreve uma ocorrência (rótulo, ícone, cor, prazo de validade)
 * mora aqui para que mapa, formulário, filtros e legenda nunca divirjam.
 *
 * IMPORTANTE: os textos são deliberadamente colaborativos ("relatado",
 * "possivelmente afetada"). O sistema não afirma o estado de uma via.
 */

export type AlertKind =
  | "alagamento"
  | "deslizamento"
  | "risco_deslizamento"
  | "enxurrada"
  | "queda_arvore"
  | "queda_poste"
  | "falta_energia"
  | "rua_interditada"
  | "danos_estruturais";

export type AlertSeverity = "baixo" | "moderado" | "alto" | "critico";

export interface LiveAlert {
  id: string;
  kind: AlertKind;
  severity: AlertSeverity;
  lat: number;
  lng: number;
  neighborhood: string;
  description: string;
  media_url: string | null;
  source: string;
  status: string;
  confirm_count: number;
  improved_count: number;
  notfound_count: number;
  confidence: number;
  created_at: string;
  last_confirmed_at: string;
  expires_at: string;
}

export interface KindMeta {
  value: AlertKind;
  label: string;
  emoji: string;
  /** Prazo base em horas, contado a partir da última confirmação. */
  ttlHours: number;
  /** Texto exibido no marcador/detalhe — sempre em tom de relato. */
  hint: string;
}

export const ALERT_KINDS: KindMeta[] = [
  { value: "alagamento", label: "Alagamento", emoji: "💧", ttlHours: 4, hint: "Trecho possivelmente afetado por água acumulada" },
  { value: "enxurrada", label: "Enxurrada / correnteza", emoji: "🌊", ttlHours: 2, hint: "Correnteza relatada; risco para pedestres" },
  { value: "deslizamento", label: "Deslizamento de terra", emoji: "⛰️", ttlHours: 48, hint: "Deslizamento relatado por moradores" },
  { value: "risco_deslizamento", label: "Risco de deslizamento", emoji: "⚠️", ttlHours: 48, hint: "Sinais de instabilidade relatados no local" },
  { value: "queda_arvore", label: "Queda de árvore ou galhos", emoji: "🌳", ttlHours: 8, hint: "Obstrução relatada na via" },
  { value: "queda_poste", label: "Queda de poste ou fiação", emoji: "🪧", ttlHours: 8, hint: "Fiação baixa ou poste danificado relatado" },
  { value: "falta_energia", label: "Falta de energia", emoji: "🔌", ttlHours: 8, hint: "Interrupção de energia relatada na região" },
  { value: "rua_interditada", label: "Rua interditada", emoji: "🚧", ttlHours: 12, hint: "Interdição relatada por moradores" },
  { value: "danos_estruturais", label: "Desabamento / danos estruturais", emoji: "🏚️", ttlHours: 48, hint: "Danos estruturais relatados no local" },
];

export const kindMeta = (kind: string): KindMeta =>
  ALERT_KINDS.find((k) => k.value === kind) ?? ALERT_KINDS[0];

export interface SeverityMeta {
  value: AlertSeverity;
  label: string;
  /** Cor do código de intensidade: amarelo → laranja → vermelho escuro. */
  color: string;
  note: string;
}

export const SEVERITIES: SeverityMeta[] = [
  { value: "baixo", label: "Baixo", color: "#FDD835", note: "Atenção" },
  { value: "moderado", label: "Moderado", color: "#FB8C00", note: "Atenção redobrada" },
  { value: "alto", label: "Alto", color: "#E64A19", note: "Risco elevado" },
  { value: "critico", label: "Crítico", color: "#8E0B0B", note: "Grave — possivelmente intransitável" },
];

export const severityMeta = (severity: string): SeverityMeta =>
  SEVERITIES.find((s) => s.value === severity) ?? SEVERITIES[1];

/** Estado de exibição derivado do tempo — não depende de rotina no servidor. */
export type DisplayStatus = "ativo" | "esmaecendo" | "expirado";

export const displayStatus = (alert: LiveAlert, now = Date.now()): DisplayStatus => {
  const expires = new Date(alert.expires_at).getTime();
  const ttl = kindMeta(alert.kind).ttlHours * 3600_000;
  if (now < expires) return "ativo";
  if (now < expires + ttl) return "esmaecendo";
  return "expirado";
};

export const confidenceBand = (score: number) =>
  score >= 70 ? "alta" : score >= 40 ? "média" : "baixa";

export const relativeTime = (iso: string, now = Date.now()) => {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const min = Math.round(diff / 60000);
  if (min < 1) return "agora mesmo";
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} h`;
  return `há ${Math.round(h / 24)} dia(s)`;
};

/** Arredonda o ponto público para ~100 m, preservando a privacidade do morador. */
export const roundPoint = (lat: number, lng: number) => ({
  lat: Math.round(lat * 1000) / 1000,
  lng: Math.round(lng * 1000) / 1000,
});

export const distanceMeters = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
) => {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const x = toRad(lng2 - lng1) * Math.cos(toRad((lat1 + lat2) / 2));
  const y = toRad(lat2 - lat1);
  return Math.sqrt(x * x + y * y) * 6371000;
};

export const DISCLAIMER =
  "Informação colaborativa enviada por moradores. Pode estar desatualizada e não substitui os avisos oficiais da Defesa Civil, da prefeitura ou dos bombeiros.";

export const CARAGUA_CENTER: [number, number] = [-23.6235, -45.4132];
