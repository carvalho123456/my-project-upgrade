import { useState } from "react";
import { motion } from "framer-motion";
import { CloudRain, Sun, Cloud, Leaf, Moon, Menu, X } from "lucide-react";
import WeatherBadge from "./WeatherBadge";
import UserMenu from "./UserMenu";
import { Link } from "@/lib/router-compat";
import { useWeatherTheme, WeatherTheme } from "@/contexts/WeatherTheme";

const navItems = [
  { label: "Início", href: "/#inicio" },
  { label: "Previsão", href: "/#previsao" },
  { label: "Mapa de Riscos", href: "/#mapa" },
  { label: "Desastres", href: "/#desastres" },
  { label: "El Niño / La Niña", href: "/el-nino-la-nina" },
  { label: "História", href: "/#historia" },
  { label: "Relatos", href: "/#relatos" },
  { label: "Prevenção", href: "/#prevencao" },
];


const themeOrder: WeatherTheme[] = ["rainy", "cloudy", "pleasant", "sunny", "night"];

const themeIcons: Record<WeatherTheme, typeof CloudRain> = {
  rainy: CloudRain,
  cloudy: Cloud,
  pleasant: Leaf,
  sunny: Sun,
  night: Moon,
};

const Header = () => {
  const [open, setOpen] = useState(false);
  const { override, setOverride, autoTheme } = useWeatherTheme();
  const currentTheme = override ?? autoTheme;
  const ThemeIcon = themeIcons[currentTheme];

  const cycleTheme = () => {
    const nextIndex = (themeOrder.indexOf(currentTheme) + 1) % themeOrder.length;
    setOverride(themeOrder[nextIndex]);
  };

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 bg-ocean-deep/90 backdrop-blur-md border-b border-ocean-mid/30"
    >
      <div className="container mx-auto flex items-center justify-between py-4 px-4">
        <button
          onClick={cycleTheme}
          className="flex items-center gap-2 focus:outline-none"
          aria-label="Mudar tema do clima"
        >
          <motion.div
            key={currentTheme}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <ThemeIcon className="h-7 w-7 text-sky" />
          </motion.div>
          <span className="font-heading text-xl font-bold text-primary-foreground tracking-tight">
            Clima Caragua
          </span>
        </button>

        <nav className="hidden lg:flex items-center gap-5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="text-sm font-medium text-ocean-pale hover:text-sky transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>


        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <WeatherBadge />
          </div>
          <UserMenu />
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden text-primary-foreground"
            aria-label="Abrir menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <motion.nav
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="lg:hidden bg-ocean-deep/95 border-t border-ocean-mid/30 px-4 pb-4"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setOpen(false)}
              className="block py-2 text-sm text-ocean-pale hover:text-sky transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </motion.nav>
      )}

    </motion.header>
  );
};

export default Header;
