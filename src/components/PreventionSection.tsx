import { motion } from "framer-motion";
import {
  Shield, Phone, Radio, PackageCheck, Route, TreePine, Trash2, AlertTriangle, Eye,
} from "lucide-react";

const tips = [
  {
    icon: Phone,
    title: "Ligue para a Defesa Civil",
    desc: "Em caso de emergência, ligue 199 (Defesa Civil) ou 193 (Bombeiros). Não espere!",
  },
  {
    icon: Radio,
    title: "Acompanhe os alertas",
    desc: "Cadastre-se nos alertas por SMS (envie CEP para 40199) e acompanhe boletins meteorológicos.",
  },
  {
    icon: PackageCheck,
    title: "Tenha um kit de emergência",
    desc: "Água, lanterna, documentos em saco plástico, remédios, roupas e alimentos não-perecíveis.",
  },
  {
    icon: Route,
    title: "Conheça rotas de fuga",
    desc: "Identifique os pontos de apoio e rotas de evacuação do seu bairro antes da emergência.",
  },
  {
    icon: TreePine,
    title: "Não desmatar encostas",
    desc: "A vegetação segura o solo. Desmatamento e cortes de terra aumentam o risco de deslizamentos.",
  },
  {
    icon: Trash2,
    title: "Não jogue lixo em rios e bueiros",
    desc: "O entupimento da drenagem é uma das principais causas de alagamentos urbanos.",
  },
  {
    icon: AlertTriangle,
    title: "Fique atento aos sinais",
    desc: "Rachaduras no solo, árvores inclinadas, água barrenta e barulhos estranhos na encosta são sinais de perigo.",
  },
  {
    icon: Eye,
    title: "Monitore chuvas prolongadas",
    desc: "Chuvas contínuas por mais de 3 dias saturem o solo. Fique em alerta máximo nesses períodos.",
  },
];

const PreventionSection = () => (
  <section id="prevencao" className="py-12 bg-secondary/50">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "300px" }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-safe/15 mb-4">
          <Shield className="h-7 w-7 text-safe" />
        </div>
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-4">
          Como se Prevenir
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          A prevenção salva vidas. Conheça as medidas essenciais para proteger
          você e sua família durante períodos de risco.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {tips.map((tip, i) => (
          <motion.div
            key={tip.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "300px" }}
            transition={{ delay: i * 0.06 }}
            className="bg-card rounded-xl p-6 shadow-card border border-border hover:shadow-elevated hover:-translate-y-1 transition-all"
          >
            <div className="flex items-center justify-center h-11 w-11 rounded-lg bg-primary/10 mb-4">
              <tip.icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-heading font-bold text-foreground mb-2 text-sm">{tip.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{tip.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Emergency banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "300px" }}
        className="mt-12 bg-ocean-deep rounded-xl p-6 sm:p-8 text-center"
      >
        <h3 className="font-heading text-2xl font-bold text-primary-foreground mb-2">
          Em caso de emergência
        </h3>
        <p className="text-ocean-pale/80 mb-6">
          Não espere! Ligue imediatamente para os números abaixo.
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          {[
            { num: "199", label: "Defesa Civil" },
            { num: "193", label: "Bombeiros" },
            { num: "190", label: "Polícia Militar" },
            { num: "192", label: "SAMU" },
          ].map((em) => (
            <div key={em.num} className="text-center">
              <div className="text-3xl font-heading font-bold text-sky">{em.num}</div>
              <div className="text-xs text-ocean-pale/70 mt-1">{em.label}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  </section>
);

export default PreventionSection;
