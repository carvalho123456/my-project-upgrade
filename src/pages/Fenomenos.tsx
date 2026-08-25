import { motion } from "framer-motion";
import {
  Thermometer,
  ThermometerSnowflake,
  Wind,
  Waves,
  CloudRain,
  Droplets,
  ArrowLeft,
  Info,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { Link } from "@/lib/router-compat";

const fadeIn = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5 },
};

const StepCard = ({
  icon: Icon,
  title,
  children,
  tone,
}: {
  icon: typeof Thermometer;
  title: string;
  children: React.ReactNode;
  tone: string;
}) => (
  <div className="flex gap-4">
    <span
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
      style={{ background: `hsl(var(--${tone}) / 0.15)` }}
    >
      <Icon className="h-5 w-5" style={{ color: `hsl(var(--${tone}))` }} />
    </span>
    <div>
      <h4 className="font-heading font-semibold text-foreground mb-1">{title}</h4>
      <p className="text-muted-foreground text-sm leading-relaxed">{children}</p>
    </div>
  </div>
);

const FenomenosPage = () => (
  <div className="min-h-screen bg-background">
    <Header />

    <section className="bg-ocean-deep text-primary-foreground pt-32 pb-16">
      <div className="container mx-auto px-4">
        <motion.div {...fadeIn}>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-ocean-pale/80 hover:text-sky transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao início
          </Link>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            El Niño e La Niña
          </h1>
          <p className="text-ocean-pale/90 text-lg max-w-3xl leading-relaxed">
            Dois fenômenos do Oceano Pacífico equatorial que alteram a circulação global do ar e
            têm efeitos diretos sobre o clima do Brasil — inclusive no litoral norte de São Paulo.
          </p>
        </motion.div>
      </div>
    </section>

    <section className="py-12 lg:py-16">
      <div className="container mx-auto px-4">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* El Niño */}
          <motion.article
            {...fadeIn}
            transition={{ ...fadeIn.transition, delay: 0.1 }}
            className="rounded-2xl border border-border bg-card p-6 lg:p-8 shadow-card"
          >
            <div className="flex items-center gap-3 mb-5">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-alert-warning/15">
                <Thermometer className="h-6 w-6 text-alert-warning" />
              </span>
              <div>
                <h2 className="font-heading text-2xl font-bold text-foreground">El Niño</h2>
                <p className="text-sm text-muted-foreground">Aquecimento anômalo do Pacífico</p>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-6">
              O El Niño é um fenômeno climático natural caracterizado pelo aquecimento anômalo das
              águas superficiais do Oceano Pacífico equatorial.
            </p>

            <div className="space-y-5">
              <StepCard icon={Wind} title="Aquecimento do Pacífico" tone="alert-warning">
                Ocorre quando os ventos alísios — que normalmente sopram de leste para oeste —
                enfraquecem ou mudam de direção.
              </StepCard>
              <StepCard icon={Waves} title="Deslocamento de calor" tone="alert-warning">
                As águas quentes acumuladas perto da Oceania e Indonésia movem-se em direção à
                costa da América do Sul.
              </StepCard>
              <StepCard icon={CloudRain} title="Mudança atmosférica" tone="alert-warning">
                Essa alteração modifica a circulação global do ar (Circulação de Walker), afetando
                o regime de chuvas e as temperaturas em várias regiões do planeta.
              </StepCard>
            </div>
          </motion.article>

          {/* La Niña */}
          <motion.article
            {...fadeIn}
            transition={{ ...fadeIn.transition, delay: 0.2 }}
            className="rounded-2xl border border-border bg-card p-6 lg:p-8 shadow-card"
          >
            <div className="flex items-center gap-3 mb-5">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky/15">
                <ThermometerSnowflake className="h-6 w-6 text-sky" />
              </span>
              <div>
                <h2 className="font-heading text-2xl font-bold text-foreground">La Niña</h2>
                <p className="text-sm text-muted-foreground">Resfriamento anormal do Pacífico</p>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-6">
              A La Niña é um fenômeno climático natural caracterizado pelo resfriamento anormal das
              águas superficiais do Oceano Pacífico Equatorial.
            </p>

            <div className="space-y-5">
              <StepCard icon={Wind} title="Ventos alísios mais fortes" tone="sky">
                O fenômeno ocorre quando os ventos alísios — que sopram de leste para oeste — ficam
                mais fortes que o normal.
              </StepCard>
              <StepCard icon={Droplets} title="Águas frias afloram" tone="sky">
                Esse fortalecimento empurra as águas quentes para o oeste do Pacífico e faz aflorar
                águas mais frias do fundo oceânico na parte central e oriental.
              </StepCard>
              <StepCard icon={Info} title="Oposto ao El Niño" tone="sky">
                Ele funciona de forma oposta ao El Niño, que aquece essas mesmas águas.
              </StepCard>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              <strong className="text-foreground">Duração:</strong> segundo o INPE, o fenômeno
              costuma durar de nove a doze meses.
            </p>
          </motion.article>
        </div>
      </div>
    </section>

    {/* Comparison table */}
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div {...fadeIn} className="max-w-4xl mx-auto">
          <h2 className="font-heading text-2xl font-bold text-foreground mb-6 text-center">
            El Niño × La Niña
          </h2>
          <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-4 text-left font-heading font-semibold text-foreground">
                      Característica
                    </th>
                    <th className="px-6 py-4 text-left font-heading font-semibold text-foreground">
                      El Niño
                    </th>
                    <th className="px-6 py-4 text-left font-heading font-semibold text-foreground">
                      La Niña
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-6 py-4 text-muted-foreground">Águas do Pacífico equatorial</td>
                    <td className="px-6 py-4 text-foreground">Mais quentes que a média</td>
                    <td className="px-6 py-4 text-foreground">Mais frias que a média</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-muted-foreground">Ventos alísios</td>
                    <td className="px-6 py-4 text-foreground">Enfraquecem ou mudam de direção</td>
                    <td className="px-6 py-4 text-foreground">Ficam mais fortes</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-muted-foreground">Circulação de Walker</td>
                    <td className="px-6 py-4 text-foreground">Alterada, empurrando calor a leste</td>
                    <td className="px-6 py-4 text-foreground">Intensificada, empurrando calor a oeste</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-muted-foreground">Tendência no Sudeste do Brasil</td>
                    <td className="px-6 py-4 text-foreground">Chuvas mais frequentes</td>
                    <td className="px-6 py-4 text-foreground">Padrões variáveis de chuva</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </section>

    {/* Local impact */}
    <section className="py-12 lg:py-16">
      <div className="container mx-auto px-4">
        <motion.div
          {...fadeIn}
          className="rounded-2xl border border-sky/30 bg-ocean-deep/10 p-6 lg:p-8"
        >
          <h2 className="font-heading text-2xl font-bold text-foreground mb-4">
            E em Caraguatatuba?
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Embora o epicentro dos fenômenos esteja no Pacífico, as mudanças na circulação atmosférica
            chegam ao Brasil e ajudam a explicar temporadas de chuva acima ou abaixo da média no
            litoral norte paulista. Por isso, o acompanhamento dos boletins da Defesa Civil e do
            INPE é tão importante para quem vive na região.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-heading font-semibold text-foreground mb-2 flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-alert-warning" />
                Durante o El Niño
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Aumenta a probabilidade de chuvas intensas e prolongadas no Sudeste, elevando o risco
                de alagamentos urbanos e deslizamentos de encosta na Serra do Mar.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-heading font-semibold text-foreground mb-2 flex items-center gap-2">
                <ThermometerSnowflake className="h-4 w-4 text-sky" />
                Durante a La Niña
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Pode trazer padrões distintos, com períodos mais secos ou chuvas concentradas. Cada
                evento é diferente, por isso o monitoramento contínuo é essencial.
              </p>
            </div>
          </div>
        </motion.div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Fonte: Instituto Nacional de Pesquisas Espaciais (INPE).
        </p>
      </div>
    </section>

    <Footer />
    <ScrollToTop />
  </div>
);

export default FenomenosPage;
