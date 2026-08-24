import { motion } from "framer-motion";
import { Trash2, TreePine, Building2, Factory, ArrowRight } from "lucide-react";

const causes = [
  {
    Icon: Trash2,
    title: "Lixo nos rios e bueiros",
    text: "Cada sacola jogada na rua vira um tampão na boca de lobo. Sem escoamento, a chuva que ia embora em minutos fica horas dentro das casas.",
    effect: "Mais alagamentos",
  },
  {
    Icon: TreePine,
    title: "Desmatamento das encostas",
    text: "As raízes da mata atlântica seguram o solo da Serra do Mar. Sem elas, a chuva encharca a terra solta e a encosta desce.",
    effect: "Mais deslizamentos",
  },
  {
    Icon: Building2,
    title: "Impermeabilização do solo",
    text: "Asfalto e concreto substituíram a areia e o mangue que absorviam a água. A cidade cresceu mais rápido que a drenagem.",
    effect: "Enchentes mais rápidas",
  },
  {
    Icon: Factory,
    title: "Mudanças climáticas",
    text: "O aquecimento do oceano deixa as chuvas mais concentradas: chove em 6 horas o que antes caía em um mês inteiro.",
    effect: "Eventos extremos mais frequentes",
  },
];

const EnvironmentSection = () => (
  <section id="meio-ambiente" className="py-12 bg-ocean-deep text-primary-foreground">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "300px" }}
        className="mb-12 max-w-3xl"
      >
        <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
          Cuidar do meio ambiente é prevenir desastres
        </h2>
        <p className="text-ocean-pale/90 text-lg leading-relaxed">
          Boa parte do que chamamos de "desastre natural" é, na verdade, resultado do
          descaso com o ambiente. Entender essa ligação é o primeiro passo da prevenção.
        </p>
      </motion.div>

      <div className="grid gap-6 sm:grid-cols-2">
        {causes.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "300px" }}
            transition={{ delay: i * 0.08 }}
            className="rounded-xl border border-ocean-mid/40 bg-ocean-mid/20 p-6 backdrop-blur-sm"
          >
            <c.Icon className="h-7 w-7 text-sky mb-3" />
            <h3 className="font-heading text-lg font-bold mb-2">{c.title}</h3>
            <p className="text-ocean-pale/80 text-sm leading-relaxed mb-4">{c.text}</p>
            <span className="inline-flex items-center gap-2 text-xs font-bold text-sky">
              <ArrowRight className="h-3.5 w-3.5" />
              {c.effect}
            </span>
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "300px" }}
        className="mt-10 rounded-xl border border-sky/30 bg-sky/10 p-6 text-ocean-pale/90"
      >
        <strong className="text-sky">Na prática:</strong> não jogue lixo em rios, córregos e
        bueiros; não faça cortes nem construções em encostas; preserve a vegetação do
        quintal; denuncie desmatamento e descarte irregular. Pequenas atitudes de bairro
        reduzem o risco de toda a cidade.
      </motion.p>
    </div>
  </section>
);

export default EnvironmentSection;
