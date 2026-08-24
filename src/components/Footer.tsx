import { CloudRain } from "lucide-react";

const Footer = () => (
  <footer className="bg-ocean-deep py-10 text-ocean-pale/70">
    <div className="container mx-auto px-4 text-center">
      <div className="flex items-center justify-center gap-2 mb-4">
        <CloudRain className="h-5 w-5 text-sky" />
        <span className="font-heading font-bold text-primary-foreground">Clima Caragua</span>
      </div>
      <p className="text-sm max-w-lg mx-auto mb-4">
        Site informativo sobre riscos climáticos em Caraguatatuba.
        Em caso de emergência, ligue 199 (Defesa Civil).
      </p>
      <p className="text-xs text-ocean-pale/40">
        © {new Date().getFullYear()} Clima Caragua. Dados baseados em informações públicas da Defesa Civil.
      </p>
    </div>
  </footer>
);

export default Footer;
