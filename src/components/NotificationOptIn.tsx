import { motion } from "framer-motion";
import { BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWeatherAlerts } from "@/hooks/useWeatherAlerts";

const NotificationOptIn = () => {
  const { permission, requestPermission, isLoggedIn } = useWeatherAlerts();

  if (!isLoggedIn || permission === "granted" || permission === "unsupported") return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border-b border-border bg-secondary/60"
    >
      <div className="container mx-auto flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3">
        <BellRing className="h-5 w-5 shrink-0 text-primary" />
        <p className="text-sm text-foreground">
          Ative as notificações para receber avisos de{" "}
          <strong>chuva intensa</strong> e <strong>ventos muito fortes</strong> em Caraguatatuba.
        </p>
        <Button
          size="sm"
          className="sm:ml-auto shrink-0"
          onClick={requestPermission}
          disabled={permission === "denied"}
        >
          {permission === "denied" ? "Bloqueado no navegador" : "Ativar alertas"}
        </Button>
      </div>
    </motion.div>
  );
};

export default NotificationOptIn;
