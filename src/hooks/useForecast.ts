import { useQuery } from "@tanstack/react-query";
import { LAT, LON, computeRisk } from "@/lib/weather";

export interface ForecastData {
  current: {
    temperature: number;
    apparent: number;
    humidity: number;
    wind: number;
    precipitation: number;
    code: number;
    isDay: boolean;
  };
  hourly: {
    time: string[];
    temperature: number[];
    precipitationProbability: number[];
    precipitation: number[];
    code: number[];
    wind: number[];
    humidity: number[];
  };
  /** Todas as horas retornadas pela API (inclui dias passados e futuros) */
  hourlyAll: {
    time: string[];
    temperature: number[];
    precipitationProbability: number[];
    precipitation: number[];
    code: number[];
    wind: number[];
    humidity: number[];
  };
  daily: {
    date: string[];
    codes: number[];
    tempMax: number[];
    tempMin: number[];
    rainSum: number[];
    rainProb: number[];
    sunrise: string[];
    sunset: string[];
  };
  rain24h: number;
  windMax24h: number;
  rainPast72h: number;
}


const URL =
  `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
  `&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,is_day` +
  `&hourly=temperature_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m,relative_humidity_2m` +
  `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,sunrise,sunset` +
  `&past_days=3&forecast_days=16&timezone=America%2FSao_Paulo`;

async function fetchForecast(): Promise<ForecastData> {
  const res = await fetch(URL);
  if (!res.ok) throw new Error("Não foi possível carregar a previsão do tempo.");
  const d = await res.json();

  const nowIso = new Date().toISOString().slice(0, 13);
  const startIdx = Math.max(
    0,
    d.hourly.time.findIndex((t: string) => t.slice(0, 13) >= nowIso),
  );
  const slice = <T,>(arr: T[]) => arr.slice(startIdx, startIdx + 24);

  const dailyDates: string[] = d.daily.time;
  const todayIdx = Math.max(0, dailyDates.findIndex((t) => t >= new Date().toISOString().slice(0, 10)));
  const rainPast72h = d.daily.precipitation_sum
    .slice(Math.max(0, todayIdx - 3), todayIdx)
    .reduce((a: number, b: number) => a + (b ?? 0), 0);

  const hourly = {
    time: slice<string>(d.hourly.time),
    temperature: slice<number>(d.hourly.temperature_2m),
    precipitationProbability: slice<number>(d.hourly.precipitation_probability),
    precipitation: slice<number>(d.hourly.precipitation),
    code: slice<number>(d.hourly.weather_code),
    wind: slice<number>(d.hourly.wind_speed_10m),
    humidity: slice<number>(d.hourly.relative_humidity_2m),
  };

  return {
    current: {
      temperature: d.current.temperature_2m,
      apparent: d.current.apparent_temperature,
      humidity: d.current.relative_humidity_2m,
      wind: d.current.wind_speed_10m,
      precipitation: d.current.precipitation,
      code: d.current.weather_code,
      isDay: d.current.is_day === 1,
    },
    hourly,
    hourlyAll: {
      time: d.hourly.time,
      temperature: d.hourly.temperature_2m,
      precipitationProbability: d.hourly.precipitation_probability,
      precipitation: d.hourly.precipitation,
      code: d.hourly.weather_code,
      wind: d.hourly.wind_speed_10m,
      humidity: d.hourly.relative_humidity_2m,
    },
    daily: {
      date: dailyDates.slice(todayIdx),
      codes: d.daily.weather_code.slice(todayIdx),
      tempMax: d.daily.temperature_2m_max.slice(todayIdx),
      tempMin: d.daily.temperature_2m_min.slice(todayIdx),
      rainSum: d.daily.precipitation_sum.slice(todayIdx),
      rainProb: d.daily.precipitation_probability_max.slice(todayIdx),
      sunrise: d.daily.sunrise.slice(todayIdx),
      sunset: d.daily.sunset.slice(todayIdx),
    },
    rain24h: hourly.precipitation.reduce((a, b) => a + (b ?? 0), 0),
    windMax24h: hourly.wind.reduce((a, b) => Math.max(a, b ?? 0), 0),
    rainPast72h,
  };
}

export function useForecast() {
  const query = useQuery({
    queryKey: ["forecast", LAT, LON],
    queryFn: fetchForecast,
    staleTime: 10 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  });

  const risk = query.data
    ? computeRisk(query.data.rain24h, query.data.rainPast72h)
    : null;

  return { ...query, risk };
}
