/** Astronomia lunar — adaptado do algoritmo SunCalc (MIT), simplificado. */
const rad = Math.PI / 180;
const dayMs = 86400000;
const J1970 = 2440588;
const J2000 = 2451545;

const toJulian = (date: Date) => date.getTime() / dayMs - 0.5 + J1970;
const fromJulian = (j: number) => new Date((j + 0.5 - J1970) * dayMs);
const toDays = (date: Date) => toJulian(date) - J2000;

const e = rad * 23.4397;

const rightAscension = (l: number, b: number) =>
  Math.atan2(Math.sin(l) * Math.cos(e) - Math.tan(b) * Math.sin(e), Math.cos(l));
const declination = (l: number, b: number) =>
  Math.asin(Math.sin(b) * Math.cos(e) + Math.cos(b) * Math.sin(e) * Math.sin(l));
const siderealTime = (d: number, lw: number) => rad * (280.16 + 360.9856235 * d) - lw;

function altitude(H: number, phi: number, dec: number) {
  return Math.asin(
    Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H),
  );
}

function moonCoords(d: number) {
  const L = rad * (218.316 + 13.176396 * d);
  const M = rad * (134.963 + 13.064993 * d);
  const F = rad * (93.272 + 13.229350 * d);
  const l = L + rad * 6.289 * Math.sin(M);
  const b = rad * 5.128 * Math.sin(F);
  const dt = 385001 - 20905 * Math.cos(M);
  return { ra: rightAscension(l, b), dec: declination(l, b), dist: dt };
}

/** Altitude (graus) da lua em um instante */
export function moonAltitude(date: Date, lat: number, lng: number): number {
  const lw = rad * -lng;
  const phi = rad * lat;
  const d = toDays(date);
  const c = moonCoords(d);
  const H = siderealTime(d, lw) - c.ra;
  let h = altitude(H, phi, c.dec);
  // refração / paralaxe aproximada
  h = h - 0.017 / Math.tan(h + (0.0031 / (h + 0.089)));
  return h / rad;
}

export interface MoonTimes {
  rise: Date | null;
  set: Date | null;
  /** ponto mais alto do dia */
  transit: Date | null;
  transitAltitude: number;
  alwaysUp: boolean;
  alwaysDown: boolean;
}

/** Nascer, culminação e ocaso da lua para o dia local informado */
export function getMoonTimes(date: Date, lat: number, lng: number): MoonTimes {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const stepMin = 5;
  const steps = (24 * 60) / stepMin;
  let rise: Date | null = null;
  let set: Date | null = null;
  let transit: Date | null = null;
  let maxAlt = -Infinity;
  let minAlt = Infinity;

  let prevT = new Date(start);
  let prevH = moonAltitude(prevT, lat, lng);

  for (let i = 1; i <= steps; i++) {
    const t = new Date(start.getTime() + i * stepMin * 60000);
    const h = moonAltitude(t, lat, lng);
    if (h > maxAlt) {
      maxAlt = h;
      transit = t;
    }
    if (h < minAlt) minAlt = h;
    if (prevH < 0 && h >= 0 && !rise) {
      rise = interp(prevT, prevH, t, h, lat, lng);
    }
    if (prevH >= 0 && h < 0 && !set) {
      set = interp(prevT, prevH, t, h, lat, lng);
    }
    prevT = t;
    prevH = h;
  }

  return {
    rise,
    set,
    transit,
    transitAltitude: maxAlt,
    alwaysUp: minAlt > 0,
    alwaysDown: maxAlt < 0,
  };
}

function interp(t0: Date, h0: number, t1: Date, h1: number, lat: number, lng: number): Date {
  let a = t0.getTime();
  let b = t1.getTime();
  let ha = h0;
  for (let i = 0; i < 20; i++) {
    const m = (a + b) / 2;
    const hm = moonAltitude(new Date(m), lat, lng);
    if (ha < 0 === hm < 0) {
      a = m;
      ha = hm;
    } else {
      b = m;
    }
  }
  return new Date((a + b) / 2);
}

export const formatTime = (d: Date | null) =>
  d ? d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "—";
