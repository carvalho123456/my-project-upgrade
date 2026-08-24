import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useForecast } from "@/hooks/useForecast";
import { useAuth } from "@/contexts/AuthContext";

const RAIN_THRESHOLD = 30; // mm nas próximas 24h
const WIND_THRESHOLD = 55; // km/h de rajada prevista
const COOLDOWN_MS = 3 * 60 * 60 * 1000; // não repete o mesmo alerta por 3h
const STORAGE_KEY = "weather-alert-last";

type Permission = "default" | "granted" | "denied" | "unsupported";

function getPermission(): Permission {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission as Permission;
}

/**
 * Envia notificações de vento forte / chuva intensa para usuários logados.
 */
export function useWeatherAlerts() {
  const { user } = useAuth();
  const { data } = useForecast();
  const [permission, setPermission] = useState<Permission>(getPermission);
  const sentRef = useRef<string | null>(null);

  const requestPermission = async () => {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result as Permission);
    if (result === "granted") toast.success("Alertas ativados para esta conta.");
  };

  useEffect(() => {
    if (!user || !data) return;

    const alerts: { key: string; title: string; body: string }[] = [];
    if (data.rain24h >= RAIN_THRESHOLD) {
      alerts.push({
        key: `rain-${Math.round(data.rain24h / 10)}`,
        title: "Chuva intensa prevista em Caraguatatuba",
        body: `${data.rain24h.toFixed(0)} mm nas próximas 24h. Evite encostas e áreas de alagamento.`,
      });
    }
    if (data.windMax24h >= WIND_THRESHOLD) {
      alerts.push({
        key: `wind-${Math.round(data.windMax24h / 10)}`,
        title: "Ventos muito fortes previstos",
        body: `Rajadas de até ${data.windMax24h.toFixed(0)} km/h. Cuidado com árvores, telhados e a orla.`,
      });
    }
    if (alerts.length === 0) return;

    const now = Date.now();
    let store: Record<string, number> = {};
    try {
      store = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    } catch {
      store = {};
    }

    for (const alert of alerts) {
      if (sentRef.current === alert.key) continue;
      if (store[alert.key] && now - store[alert.key] < COOLDOWN_MS) continue;

      toast.warning(alert.title, { description: alert.body, duration: 10000 });
      if (getPermission() === "granted") {
        try {
          new Notification(alert.title, { body: alert.body, icon: "/favicon.ico" });
        } catch {
          /* ignora falhas de notificação do navegador */
        }
      }
      store[alert.key] = now;
      sentRef.current = alert.key;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }, [user, data]);

  const hasRisk = !!data && (data.rain24h >= RAIN_THRESHOLD || data.windMax24h >= WIND_THRESHOLD);

  return { permission, requestPermission, isLoggedIn: !!user, hasRisk };
}
