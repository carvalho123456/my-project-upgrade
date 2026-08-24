import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CloudRain, Sun, Cloud, Leaf, Moon, Palette, X, Check } from "lucide-react";
import { useWeatherTheme, THEME_LABELS, WeatherTheme } from "@/contexts/WeatherTheme";

const options: { key: WeatherTheme; Icon: typeof Sun }[] = [
  { key: "rainy", Icon: CloudRain },
  { key: "sunny", Icon: Sun },
  { key: "cloudy", Icon: Cloud },
  { key: "pleasant", Icon: Leaf },
  { key: "night", Icon: Moon },
];

const ThemePreviewSwitcher = () => {
  const { override, setOverride, autoTheme } = useWeatherTheme();
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-elevated flex items-center justify-center"
        aria-label="Pré-visualizar temas"
      >
        <Palette className="h-6 w-6" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-72 rounded-2xl border border-border bg-card p-4 shadow-elevated backdrop-blur-md"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-heading font-bold text-sm text-foreground">Visualizar temas</h3>
                <p className="text-xs text-muted-foreground">Pré-visualize cada clima</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {options.map(({ key, Icon }) => {
                const active = (override ?? autoTheme) === key;
                const isOverride = override === key;
                return (
                  <button
                    key={key}
                    onClick={() => setOverride(key)}
                    className={`relative flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all ${
                      active
                        ? "border-primary bg-primary/10"
                        : "border-border bg-background hover:border-primary/50"
                    }`}
                  >
                    {isOverride && (
                      <Check className="absolute top-1.5 right-1.5 h-3.5 w-3.5 text-primary" />
                    )}
                    <Icon className="h-5 w-5 text-primary" />
                    <span className="text-xs font-medium text-foreground text-center leading-tight">
                      {THEME_LABELS[key]}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setOverride(null)}
              disabled={!override}
              className="mt-3 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground hover:bg-secondary/80 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {override ? "Voltar ao clima real" : "Usando clima real"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ThemePreviewSwitcher;
