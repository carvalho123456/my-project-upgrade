import { motion } from "framer-motion";
import { Radio, ShieldCheck, Users } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import LiveMapSection from "@/components/livemap/LiveMapSection";
import { DISCLAIMER } from "@/lib/liveAlerts";

const MapaColaborativo = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <main className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15">
            <Radio className="h-7 w-7 text-primary" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
            Mapa colaborativo em tempo real
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-muted-foreground">
            Alagamentos, deslizamentos, quedas de árvore, falta de energia e ruas interditadas
            relatados pelos próprios moradores de Caraguatatuba — com confirmação coletiva e
            validade temporária.
          </p>
        </motion.div>

        <div className="mb-8 grid gap-3 sm:grid-cols-3">
          {[
            { icon: Users, title: "Confirmação coletiva", text: "Quem passa pelo local confirma se a ocorrência continua." },
            { icon: Radio, title: "Validade temporária", text: "Sem confirmações novas, o alerta esmaece e sai do mapa." },
            { icon: ShieldCheck, title: "Privacidade", text: "Localização só por clique e ponto arredondado em ~100 m." },
          ].map((c) => (
            <div key={c.title} className="rounded-xl border border-border bg-card p-4 shadow-card">
              <c.icon className="mb-2 h-5 w-5 text-primary" />
              <h2 className="font-heading text-sm font-bold text-foreground">{c.title}</h2>
              <p className="text-xs text-muted-foreground">{c.text}</p>
            </div>
          ))}
        </div>

        <LiveMapSection />

        <p className="mt-6 rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
          {DISCLAIMER}
        </p>
      </div>
    </main>
    <Footer />
    <ScrollToTop />
  </div>
);

export default MapaColaborativo;
