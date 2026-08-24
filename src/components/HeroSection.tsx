import { motion } from "framer-motion";
import { ChevronDown, CloudRain, Sun, Cloud, Leaf, Moon } from "lucide-react";
import heroImg from "@/assets/hero-caraguatatuba.jpg";
import { useWeatherTheme } from "@/contexts/WeatherTheme";

const themeMeta = {
  rainy: { Icon: CloudRain, imgClass: "" },
  sunny: { Icon: Sun, imgClass: "saturate-125 hue-rotate-[-15deg] brightness-105" },
  cloudy: { Icon: Cloud, imgClass: "saturate-50 brightness-95" },
  pleasant: { Icon: Leaf, imgClass: "saturate-110 brightness-105" },
  night: { Icon: Moon, imgClass: "saturate-75 brightness-50 contrast-110" },
};

const HeroSection = () => {
  const { theme, label } = useWeatherTheme();
  const { Icon, imgClass } = themeMeta[theme];

  return (
    <section id="inicio" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="Vista aérea de Caraguatatuba"
          className={`w-full h-full object-cover transition-all duration-700 ${imgClass}`}
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-ocean-deep/70 transition-colors duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-ocean-deep via-transparent to-transparent" />
      </div>

      <div className="relative container mx-auto px-4 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 border border-primary/30 px-4 py-1.5 mb-6">
            <Icon className="h-4 w-4 text-sky" />
            <span className="text-sm font-medium text-sky">{label} • Caraguatatuba</span>
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            <span className="text-primary-foreground">Mapa de Riscos de</span>
            <br />
            <span className="text-gradient">Caraguatatuba</span>
          </h1>

          <p className="text-lg sm:text-xl text-ocean-pale/90 max-w-xl mb-8 leading-relaxed">
            Conheça as áreas de risco de alagamentos e deslizamentos da cidade.
            Saiba como se proteger e prevenir desastres naturais.
          </p>

          <div className="flex flex-wrap gap-4">
            <a
              href="#mapa"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:brightness-110 transition shadow-elevated"
            >
              Ver Mapa de Riscos
            </a>
            <a
              href="#prevencao"
              className="inline-flex items-center gap-2 rounded-lg border border-ocean-pale/30 px-6 py-3 font-semibold text-primary-foreground hover:bg-ocean-mid/30 transition"
            >
              Como se Prevenir
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className="h-8 w-8 text-sky animate-float" />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
