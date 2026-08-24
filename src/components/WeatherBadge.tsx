import { CloudRain, Sun, Cloud, Leaf, Moon, Loader2 } from "lucide-react";
import { useWeatherTheme } from "@/contexts/WeatherTheme";

const iconMap = {
  rainy: CloudRain,
  sunny: Sun,
  cloudy: Cloud,
  pleasant: Leaf,
  night: Moon,
} as const;

const WeatherBadge = () => {
  const { theme, label, temperature, loading } = useWeatherTheme();
  const Icon = loading ? Loader2 : iconMap[theme];

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1.5 backdrop-blur-md">
      <Icon className={`h-4 w-4 text-sky ${loading ? "animate-spin" : ""}`} />
      <span className="text-xs font-semibold text-primary-foreground">
        {label}
        {temperature !== null && ` • ${Math.round(temperature)}°C`}
      </span>
    </div>
  );
};

export default WeatherBadge;
