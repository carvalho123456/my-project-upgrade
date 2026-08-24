import { useState } from "react";
import { motion } from "framer-motion";
import { Droplets, Mountain, Phone, Play, ListChecks } from "lucide-react";

const guides = {
  alagamento: {
    Icon: Droplets,
    tone: "alert-flood",
    label: "Se a água invadir",
    steps: [
      "Desligue a chave geral de energia antes que a água chegue às tomadas.",
      "Suba para o ponto mais alto da casa levando documentos, remédios e celular.",
      "Nunca atravesse ruas alagadas a pé ou de carro — 30 cm de água movem um veículo.",
      "Não toque em fios ou aparelhos molhados e feche o registro de gás.",
      "Ligue 199 (Defesa Civil) ou 193 (Bombeiros) e informe o endereço exato.",
      "Depois: ferva a água antes de beber, lave tudo com água sanitária e procure um posto se tiver febre.",
    ],
    query: "o que fazer em caso de enchente Defesa Civil orientações",
  },
  deslizamento: {
    Icon: Mountain,
    tone: "alert-landslide",
    label: "Se a encosta der sinais",
    steps: [
      "Ao ver rachaduras, árvores tortas, estalos ou água barrenta no barranco, saia imediatamente.",
      "Avise vizinhos no caminho — cada minuto conta.",
      "Afaste-se para o lado, nunca desça na direção do escorregamento.",
      "Vá para um ponto de apoio ou casa de parentes em área plana.",
      "Ligue 199 e não volte para buscar objetos.",
      "Só retorne quando a Defesa Civil liberar o imóvel.",
    ],
    query: "sinais de deslizamento o que fazer Defesa Civil encosta",
  },
} as const;

type Key = keyof typeof guides;

const EmergencyGuide = () => {
  const [tab, setTab] = useState<Key>("alagamento");
  const g = guides[tab];

  return (
    <section id="emergencia" className="py-12 bg-secondary/40">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "300px" }}
          className="mb-10 text-center"
        >
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/15 mb-4">
            <ListChecks className="h-7 w-7 text-primary" />
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Passo a passo na emergência
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            O que fazer, na ordem certa, se você for atingido. Leia agora — na hora do
            desastre não dá tempo de procurar.
          </p>
        </motion.div>

        <div className="flex justify-center gap-3 mb-8">
          {(Object.keys(guides) as Key[]).map((k) => {
            const Item = guides[k].Icon;
            const active = tab === k;
            return (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-primary text-primary-foreground shadow-card"
                    : "bg-card text-muted-foreground border border-border hover:text-foreground"
                }`}
              >
                <Item className="h-4 w-4" />
                {guides[k].label}
              </button>
            );
          })}
        </div>

        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-3xl rounded-xl bg-card border border-border p-6 sm:p-8 shadow-card"
        >
          <ol className="space-y-4">
            {g.steps.map((s, i) => (
              <li key={s} className="flex gap-4">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-heading font-bold text-sm"
                  style={{
                    background: `hsl(var(--${g.tone}) / 0.15)`,
                    color: `hsl(var(--${g.tone}))`,
                  }}
                >
                  {i + 1}
                </span>
                <p className="pt-1 text-foreground leading-relaxed">{s}</p>
              </li>
            ))}
          </ol>

          <div className="mt-8 flex flex-wrap gap-3 border-t border-border pt-6">
            <a
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(g.query)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110 transition"
            >
              <Play className="h-4 w-4" /> Assistir orientações de especialistas
            </a>
            <a
              href="tel:199"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary transition"
            >
              <Phone className="h-4 w-4" /> Ligar 199 — Defesa Civil
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default EmergencyGuide;
