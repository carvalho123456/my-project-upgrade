export const SYNODIC = 29.530588853;
// Lua nova de referência: 2000-01-06 18:14 UTC
const REF_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14) / 86400000;

/** Idade da lua em dias (0 = nova) */
export function moonAge(date: Date): number {
  const days = date.getTime() / 86400000 - REF_NEW_MOON;
  return ((days % SYNODIC) + SYNODIC) % SYNODIC;
}

/** Fase normalizada 0..1 */
export const moonPhase = (date: Date) => moonAge(date) / SYNODIC;

/** Fração iluminada 0..1 */
export const moonIllumination = (date: Date) =>
  (1 - Math.cos(2 * Math.PI * moonPhase(date))) / 2;

export const PHASE_NAMES = [
  "Lua Nova",
  "Crescente Côncava",
  "Quarto Crescente",
  "Crescente Gibosa",
  "Lua Cheia",
  "Minguante Gibosa",
  "Quarto Minguante",
  "Minguante Côncava",
] as const;

export function phaseName(date: Date): string {
  const p = moonPhase(date);
  const idx = Math.floor(p * 8 + 0.5) % 8;
  return PHASE_NAMES[idx];
}

/** Data da próxima ocorrência de uma fase (0 = nova, .25 quarto crescente, .5 cheia, .75 minguante) */
export function nextPhaseDate(target: number, from: Date = new Date()): Date {
  const p = moonPhase(from);
  let delta = target - p;
  if (delta <= 0.001) delta += 1;
  return new Date(from.getTime() + delta * SYNODIC * 86400000);
}

export const formatPhaseDate = (d: Date) =>
  d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) +
  " · " +
  d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
