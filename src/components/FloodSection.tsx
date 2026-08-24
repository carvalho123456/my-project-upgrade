import { motion } from "framer-motion";
import { Droplets, AlertTriangle, MapPin, TrendingUp } from "lucide-react";

const floodAreas = [
  {
    area: "Centro / Martim de Sá",
    severity: "Alto",
    cause: "Proximidade ao nível do mar e impermeabilização do solo urbano.",
  },
  {
    area: "Sumaré / Jardim Primavera",
    severity: "Alto",
    cause: "Planície com sistema de drenagem insuficiente para chuvas intensas.",
  },
  {
    area: "Rio Santo Antônio",
    severity: "Médio",
    cause: "Transbordamento do rio durante precipitações prolongadas.",
  },
  {
    area: "Massaguaçu",
    severity: "Médio",
    cause: "Área costeira vulnerável a inundações por maré alta e chuvas.",
  },
];

const FloodSection = () => (
  <section id="alagamentos" className="py-12 bg-secondary/50">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "300px" }}
        className="mb-12"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-alert-flood/15">
            <Droplets className="h-6 w-6 text-alert-flood" />
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
            Áreas de Alagamento
          </h2>
        </div>
        <p className="text-muted-foreground max-w-2xl text-lg">
          Caraguatatuba está entre o mar e a Serra do Mar, o que cria condições
          propícias para alagamentos, especialmente no verão.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-6">
        {floodAreas.map((item, i) => (
          <motion.div
            key={item.area}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "300px" }}
            transition={{ delay: i * 0.1 }}
            className="bg-card rounded-xl p-6 shadow-card border border-border hover:shadow-elevated transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-alert-flood" />
                <h3 className="font-heading font-bold text-foreground">{item.area}</h3>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                item.severity === "Alto"
                  ? "bg-destructive/15 text-destructive"
                  : "bg-alert-warning/15 text-alert-warning"
              }`}>
                {item.severity}
              </span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">{item.cause}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "300px" }}
        className="mt-10 bg-card rounded-xl p-6 shadow-card border border-border"
      >
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="font-heading font-bold text-foreground text-lg">Por que alaga tanto?</h3>
        </div>
        <ul className="space-y-2 text-muted-foreground text-sm">
          <li className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-alert-warning mt-0.5 shrink-0" />
            <span>A cidade está numa planície costeira entre a Serra do Mar e o oceano, concentrando as águas das chuvas.</span>
          </li>
          <li className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-alert-warning mt-0.5 shrink-0" />
            <span>A urbanização intensa impermeabilizou o solo, reduzindo a absorção natural da água.</span>
          </li>
          <li className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-alert-warning mt-0.5 shrink-0" />
            <span>Rios e córregos assoreados diminuem a capacidade de escoamento.</span>
          </li>
          <li className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-alert-warning mt-0.5 shrink-0" />
            <span>Chuvas orográficas da Serra do Mar intensificam a precipitação na região.</span>
          </li>
        </ul>
      </motion.div>
    </div>
  </section>
);

export default FloodSection;
