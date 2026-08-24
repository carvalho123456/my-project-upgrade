import { motion } from "framer-motion";
import { Mountain, AlertTriangle, MapPin, History } from "lucide-react";

const landslideAreas = [
  {
    area: "Serra do Mar (Região Serrana)",
    severity: "Muito Alto",
    description: "Região do grande desastre de 1967. Encostas íngremes com solo saturado.",
  },
  {
    area: "Morro do Algodão",
    severity: "Muito Alto",
    description: "Solo instável em encosta íngreme. Ocupações em área de risco.",
  },
  {
    area: "Tabatinga / Mococa",
    severity: "Alto",
    description: "Encostas da Serra com histórico de movimentos de massa.",
  },
];

const LandslideSection = () => (
  <section id="deslizamentos" className="py-12 bg-background">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "300px" }}
        className="mb-12"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-alert-landslide/15">
            <Mountain className="h-6 w-6 text-alert-landslide" />
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
            Áreas de Deslizamento
          </h2>
        </div>
        <p className="text-muted-foreground max-w-2xl text-lg">
          A Serra do Mar apresenta encostas íngremes e solo frágil, tornando a
          região propensa a deslizamentos durante períodos chuvosos.
        </p>
      </motion.div>

      {/* Historical event */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "300px" }}
        className="bg-ocean-deep rounded-xl p-6 sm:p-8 mb-10 text-primary-foreground"
      >
        <div className="flex items-center gap-3 mb-4">
          <History className="h-6 w-6 text-sky" />
          <h3 className="font-heading font-bold text-xl">O Desastre de 1967</h3>
        </div>
        <p className="text-ocean-pale/90 leading-relaxed mb-4">
          Em 18 de março de 1967, após dias de chuvas intensas, uma série de
          deslizamentos desceu a Serra do Mar, devastando Caraguatatuba. Foram mais
          de <strong className="text-sky">400 mortes</strong>, milhares de desabrigados e a destruição de grande
          parte da infraestrutura. Foi uma das maiores catástrofes naturais do Brasil
          e reforça a importância da prevenção.
        </p>
        <p className="text-ocean-pale/70 text-sm">
          Este evento mudou para sempre a relação da cidade com o risco geológico
          e motivou a criação de sistemas de alerta e monitoramento.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-3 gap-6">
        {landslideAreas.map((item, i) => (
          <motion.div
            key={item.area}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "300px" }}
            transition={{ delay: i * 0.1 }}
            className="bg-card rounded-xl p-6 shadow-card border border-border hover:shadow-elevated transition-shadow"
          >
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-5 w-5 text-alert-landslide" />
              <h3 className="font-heading font-bold text-foreground text-sm">{item.area}</h3>
            </div>
            <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-alert-landslide/15 text-alert-landslide mb-3">
              {item.severity}
            </span>
            <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default LandslideSection;
