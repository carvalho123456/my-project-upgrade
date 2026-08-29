import { motion } from "framer-motion";
import { ArrowRight, Radio } from "lucide-react";
import { Link } from "@/lib/router-compat";

/** Bloco de destaque na home que leva ao mapa colaborativo. */
const LiveMapTeaser = () => (
  <section id="colaborativo" className="py-12 bg-background">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "300px" }}
        className="flex flex-col items-start gap-5 rounded-2xl border border-border bg-card p-6 shadow-card sm:flex-row sm:items-center"
      >
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/15">
          <Radio className="h-7 w-7 text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="font-heading text-2xl font-bold text-foreground">
            Mapa colaborativo em tempo real
          </h2>
          <p className="mt-1 text-muted-foreground">
            Veja alagamentos, deslizamentos, quedas de árvore, falta de energia e ruas
            interditadas relatados agora pelos moradores — e confirme o que você está vendo
            na sua rua.
          </p>
        </div>
        <Link
          to="/mapa-colaborativo"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:brightness-110"
        >
          Abrir o mapa <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    </div>
  </section>
);

export default LiveMapTeaser;
