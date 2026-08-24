import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type WeatherTheme = "rainy" | "sunny" | "cloudy" | "pleasant" | "night";

interface WeatherInfo {
  theme: WeatherTheme;
  label: string;
  temperature: number | null;
  loading: boolean;
  override: WeatherTheme | null;
  setOverride: (t: WeatherTheme | null) => void;
  autoTheme: WeatherTheme;
  autoLabel: string;
}

const WeatherThemeContext = createContext<WeatherInfo | undefined>(undefined);

const LAT = -23.62;
const LON = -45.41;

const RAIN_CODES = new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99]);
const CLOUDY_CODES = new Set([3, 45, 48]);
const CLEAR_CODES = new Set([0, 1]);

export const THEME_LABELS: Record<WeatherTheme, string> = {
  rainy: "Chuvoso",
  sunny: "Ensolarado",
  cloudy: "Nublado",
  pleasant: "Tempo Agradável",
  night: "Noite",
};

/** Entre 18h e 6h o site entra no tema noturno (lua). */
export const isNightHour = (d = new Date()) => {
  const h = d.getHours();
  return h >= 18 || h < 6;
};

function decideTheme(code: number, temp: number, precip: number): { theme: WeatherTheme; label: string } {
  if (isNightHour()) return { theme: "night", label: THEME_LABELS.night };
  if (precip > 0.1 || RAIN_CODES.has(code)) return { theme: "rainy", label: THEME_LABELS.rainy };
  if (CLOUDY_CODES.has(code)) return { theme: "cloudy", label: THEME_LABELS.cloudy };
  if (CLEAR_CODES.has(code) && temp >= 27) return { theme: "sunny", label: THEME_LABELS.sunny };
  if (temp >= 18 && temp <= 27) return { theme: "pleasant", label: THEME_LABELS.pleasant };
  if (CLEAR_CODES.has(code)) return { theme: "sunny", label: THEME_LABELS.sunny };
  return { theme: "cloudy", label: THEME_LABELS.cloudy };
}

export const WeatherThemeProvider = ({ children }: { children: ReactNode }) => {
  const [autoTheme, setAutoTheme] = useState<WeatherTheme>("pleasant");
  const [autoLabel, setAutoLabel] = useState<string>("Carregando clima...");
  const [temperature, setTemperature] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [override, setOverrideState] = useState<WeatherTheme | null>(null);

  useEffect(() => {
    const v = localStorage.getItem("weather-override");
    if (v === "rainy" || v === "sunny" || v === "cloudy" || v === "pleasant" || v === "night") {
      setOverrideState(v as WeatherTheme);
    }
  }, []);

  const setOverride = (t: WeatherTheme | null) => {
    setOverrideState(t);
    if (t) localStorage.setItem("weather-override", t);
    else localStorage.removeItem("weather-override");
  };

  useEffect(() => {
    let cancelled = false;
    const fetchWeather = async () => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,precipitation,weather_code&timezone=America%2FSao_Paulo`;
        const res = await fetch(url);
        const data = await res.json();
        const c = data?.current;
        if (!c || cancelled) return;
        const { theme, label } = decideTheme(c.weather_code, c.temperature_2m, c.precipitation);
        setAutoTheme(theme);
        setAutoLabel(label);
        setTemperature(c.temperature_2m);
        setLoading(false);
      } catch {
        if (!cancelled) {
          setAutoLabel("Tempo Agradável");
          setLoading(false);
        }
      }
    };
    fetchWeather();
    const id = setInterval(fetchWeather, 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const theme = override ?? autoTheme;
  const label = override ? `${THEME_LABELS[override]} (preview)` : autoLabel;

  useEffect(() => {
    document.documentElement.setAttribute("data-weather", theme);
  }, [theme]);

  return (
    <WeatherThemeContext.Provider
      value={{ theme, label, temperature, loading, override, setOverride, autoTheme, autoLabel }}
    >
      {children}
    </WeatherThemeContext.Provider>
  );
};

export const useWeatherTheme = () => {
  const ctx = useContext(WeatherThemeContext);
  if (!ctx) throw new Error("useWeatherTheme must be used within WeatherThemeProvider");
  return ctx;
};
