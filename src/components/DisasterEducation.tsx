import { motion } from "framer-motion";
import { Droplets, Mountain, Wind, Waves, Play, AlertTriangle } from "lucide-react";

const disasters = [
  {
    Icon: Droplets,
    tone: "alert-flood",
    name: "Alagamento e enchente",
    what: "A água da chuva não consegue escoar e toma ruas e casas. A enchente acontece quando um rio transborda.",
    signs: "Água subindo rápido na sarjeta, bueiros jorrando, correnteza na rua.",
    risks: "Afogamento, choque elétrico, doenças como leptospirose e perda de bens.",
    query: "alagamento Caraguatatuba litoral norte chuva",
  },
  {
    Icon: Mountain,
    tone: "alert-landslide",
    name: "Deslizamento de terra",
    what: "Parte de uma encosta se desprende e desliza morro abaixo, geralmente depois de dias de chuva.",
    signs: "Rachaduras no chão e nas paredes, postes e árvores inclinados, água barrenta brotando do barranco, estalos.",
    risks: "Soterramento de casas, é o desastre mais letal da região serrana.",
    query: "deslizamento de terra Serra do Mar São Sebastião Caraguatatuba",
  },
  {
    Icon: Wind,
    tone: "alert-warning",
    name: "Vendaval e tempestade",
    what: "Ventos fortes acompanhados de raios e chuva intensa, comuns nas tardes de verão.",
    signs: "Nuvem escura avançando do mar, queda brusca de temperatura, rajadas repentinas.",
    risks: "Queda de árvores e postes, destelhamento, falta de energia.",
    query: "vendaval temporal litoral norte São Paulo estragos",
  },
  {
    Icon: Waves,
    tone: "ocean-light",
    name: "Ressaca do mar",
    what: "Ondas muito acima do normal que avançam sobre a faixa de areia e a orla.",
    signs: "Mar agitado, avanço da água além do normal, avisos da Marinha.",
    risks: "Erosão da praia, destruição de quiosques e calçadões, risco a banhistas.",
    query: "ressaca do mar litoral norte SP ondas orla",
  },
];

const yt = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;

const DisasterEducation = () => (
  <section id="desastres" className="py-12 bg-background">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "300px" }}
        className="mb-12 text-center"
      >
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-3">
          O que são os desastres naturais
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Textos curtos para você identificar cada tipo de evento, reconhecer os sinais
          de perigo e entender os riscos que ele traz.
        </p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        {disasters.map((d, i) => (
          <motion.article
            key={d.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "300px" }}
            transition={{ delay: i * 0.08 }}
            className="rounded-xl bg-card border border-border p-6 shadow-card hover:shadow-elevated transition-shadow"
          >
            <div className="flex items-center gap-3 mb-3">
              <span
                className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ background: `hsl(var(--${d.tone}) / 0.15)` }}
              >
                <d.Icon className="h-5 w-5" style={{ color: `hsl(var(--${d.tone}))` }} />
              </span>
              <h3 className="font-heading text-xl font-bold text-foreground">{d.name}</h3>
            </div>

            <p className="text-muted-foreground leading-relaxed mb-4">{d.what}</p>

            <div className="space-y-2 mb-5 text-sm">
              <p className="flex gap-2 text-foreground">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-alert-warning" />
                <span>
                  <strong>Sinais de alerta:</strong> {d.signs}
                </span>
              </p>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Riscos:</strong> {d.risks}
              </p>
            </div>

            <a
              href={yt(d.query)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20 transition"
            >
              <Play className="h-4 w-4" />
              Ver vídeos reais deste desastre
            </a>
          </motion.article>
        ))}
      </div>
    </div>
  </section>
);

export default DisasterEducation;
