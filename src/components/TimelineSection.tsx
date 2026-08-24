import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Calendar, ExternalLink, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const fetchEvents = async () => {
  const { data, error } = await supabase
    .from("timeline_events")
    .select("*")
    .order("event_date", { ascending: true });
  if (error) throw error;
  return data;
};

const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const TimelineSection = () => {
  const { data, isLoading } = useQuery({ queryKey: ["timeline"], queryFn: fetchEvents });

  return (
    <section id="historia" className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "300px" }}
          className="mb-12 text-center"
        >
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Linha do tempo dos desastres
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            A história climática de Caraguatatuba e região. Conhecer o passado é a melhor
            forma de entender os perigos do presente.
          </p>
        </motion.div>

        {isLoading && (
          <div className="space-y-4 max-w-3xl mx-auto">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        )}

        <div className="relative max-w-3xl mx-auto">
          {data && data.length > 0 && (
            <div className="absolute left-4 top-2 bottom-2 w-px bg-border sm:left-1/2" />
          )}

          {data?.map((ev, i) => (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "300px" }}
              transition={{ delay: 0.05 * i }}
              className={`relative pl-12 pb-8 sm:w-1/2 sm:pl-0 ${
                i % 2 === 0 ? "sm:pr-10 sm:text-right" : "sm:ml-auto sm:pl-10"
              }`}
            >
              <span
                className={`absolute left-2.5 top-2 h-3 w-3 rounded-full bg-primary ring-4 ring-background ${
                  i % 2 === 0 ? "sm:-right-1.5 sm:left-auto" : "sm:-left-1.5"
                }`}
              />
              <div className="rounded-xl bg-card border border-border p-5 shadow-card">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary mb-2">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(ev.event_date)}
                </span>
                <h3 className="font-heading text-lg font-bold text-foreground mb-2">
                  {ev.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{ev.summary}</p>

                <div
                  className={`mt-3 flex flex-wrap gap-3 ${
                    i % 2 === 0 ? "sm:justify-end" : ""
                  }`}
                >
                  <a
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                      `${ev.title} Caraguatatuba`,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                  >
                    <Play className="h-3.5 w-3.5" /> Vídeos
                  </a>
                  {ev.source_url && (
                    <a
                      href={ev.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Saiba mais
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TimelineSection;
