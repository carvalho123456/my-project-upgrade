export const LAT = -23.62;
export const LON = -45.41;

export const WEATHER_CODE_LABELS: Record<number, string> = {
  0: "Céu limpo",
  1: "Predomínio de sol",
  2: "Parcialmente nublado",
  3: "Nublado",
  45: "Névoa",
  48: "Névoa com geada",
  51: "Garoa fraca",
  53: "Garoa",
  55: "Garoa forte",
  56: "Garoa congelante",
  57: "Garoa congelante forte",
  61: "Chuva fraca",
  63: "Chuva moderada",
  65: "Chuva forte",
  66: "Chuva congelante",
  67: "Chuva congelante forte",
  71: "Neve fraca",
  73: "Neve",
  75: "Neve forte",
  80: "Pancadas de chuva",
  81: "Pancadas moderadas",
  82: "Pancadas fortes",
  95: "Tempestade",
  96: "Tempestade com granizo",
  99: "Tempestade severa",
};

export const codeLabel = (code: number | undefined) =>
  code === undefined ? "—" : WEATHER_CODE_LABELS[code] ?? "Instável";

export type RiskLevel = "seguro" | "atencao" | "alerta" | "critico";

export interface RiskInfo {
  level: RiskLevel;
  title: string;
  message: string;
}

export const RISK_META: Record<RiskLevel, { label: string; tone: string }> = {
  seguro: { label: "Sem risco", tone: "safe" },
  atencao: { label: "Atenção", tone: "alert-warning" },
  alerta: { label: "Alerta", tone: "alert-landslide" },
  critico: { label: "Alerta máximo", tone: "destructive" },
};

/**
 * Calcula o nível de risco a partir da chuva das próximas 24h
 * e do acumulado dos últimos dias (solo saturado).
 */
export function computeRisk(rain24h: number, rain72hPast: number): RiskInfo {
  if (rain24h >= 80 || rain24h + rain72hPast >= 180) {
    return {
      level: "critico",
      title: "Alerta máximo de chuva intensa",
      message:
        "Volume muito alto previsto e solo encharcado. Risco elevado de alagamentos e deslizamentos. Evite áreas de encosta e ribeirinhas.",
    };
  }
  if (rain24h >= 40 || rain72hPast >= 100) {
    return {
      level: "alerta",
      title: "Alerta de chuva forte",
      message:
        "Chuva significativa prevista para as próximas horas. Atenção em bairros com histórico de alagamento e em encostas.",
    };
  }
  if (rain24h >= 10 || rain72hPast >= 50) {
    return {
      level: "atencao",
      title: "Atenção: chuva a caminho",
      message:
        "Pode haver acúmulo de água em vias e pontos de alagamento conhecidos. Acompanhe os boletins.",
    };
  }
  return {
    level: "seguro",
    title: "Sem alertas para Caraguatatuba",
    message: "Nenhum evento climático de risco previsto para as próximas 24 horas.",
  };
}

export const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export const formatDay = (iso: string) => {
  const d = new Date(`${iso}T12:00:00`);
  return WEEKDAYS[d.getDay()];
};

export const formatHour = (iso: string) => iso.slice(11, 16);

const COMPASS = [
  { abbr: "N", name: "Norte" },
  { abbr: "NNE", name: "Nor-nordeste" },
  { abbr: "NE", name: "Nordeste" },
  { abbr: "ENE", name: "Lés-nordeste" },
  { abbr: "L", name: "Leste" },
  { abbr: "ESE", name: "Lés-sudeste" },
  { abbr: "SE", name: "Sudeste" },
  { abbr: "SSE", name: "Su-sudeste" },
  { abbr: "S", name: "Sul" },
  { abbr: "SSO", name: "Su-sudoeste" },
  { abbr: "SO", name: "Sudoeste" },
  { abbr: "OSO", name: "Oés-sudoeste" },
  { abbr: "O", name: "Oeste" },
  { abbr: "ONO", name: "Oés-noroeste" },
  { abbr: "NO", name: "Noroeste" },
  { abbr: "NNO", name: "Nor-noroeste" },
];

/** Converte graus (direção DE onde o vento vem) em ponto cardeal. */
export const windCompass = (deg: number | undefined) => {
  if (deg == null || Number.isNaN(deg)) return { abbr: "—", name: "—", deg: 0 };
  const d = ((deg % 360) + 360) % 360;
  const i = Math.round(d / 22.5) % 16;
  return { ...COMPASS[i], deg: d };
};
