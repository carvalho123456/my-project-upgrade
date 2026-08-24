import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { MessageSquarePlus, Loader2, ShieldCheck, MapPin, Clock, UserRound } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const HAZARDS = [
  { value: "alagamento", label: "Alagamento" },
  { value: "deslizamento", label: "Deslizamento" },
  { value: "vendaval", label: "Vendaval" },
  { value: "ressaca", label: "Ressaca do mar" },
  { value: "outro", label: "Outro" },
] as const;

const SEVERITY = [
  { value: 1, label: "Leve" },
  { value: 2, label: "Moderado" },
  { value: 3, label: "Grave" },
];

const schema = z.object({
  hazard: z.enum(["alagamento", "deslizamento", "vendaval", "ressaca", "outro"]),
  neighborhood: z.string().trim().min(2, "Informe o bairro").max(120),
  description: z
    .string()
    .trim()
    .min(10, "Descreva com pelo menos 10 caracteres")
    .max(1000, "Máximo de 1000 caracteres"),
  severity: z.number().int().min(1).max(3),
});

const fetchApproved = async () => {
  const { data, error } = await supabase
    .from("reports")
    .select("id, hazard, neighborhood, description, severity, occurred_at")
    .eq("status", "aprovado")
    .order("occurred_at", { ascending: false })
    .limit(12);
  if (error) throw error;
  return data;
};

const severityLabel = (n: number) => SEVERITY.find((s) => s.value === n)?.label ?? "—";

const ReportsSection = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [hazard, setHazard] = useState<(typeof HAZARDS)[number]["value"]>("alagamento");
  const [neighborhood, setNeighborhood] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState(2);
  const [sending, setSending] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const locate = () => {
    if (!navigator.geolocation) {
      toast.error("Seu navegador não permite obter a localização.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        toast.success("Localização adicionada ao relato.");
      },
      () => toast.error("Não conseguimos acessar sua localização."),
    );
  };

  const { data: approved, isLoading } = useQuery({
    queryKey: ["approved-reports"],
    queryFn: fetchApproved,
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const parsed = schema.safeParse({ hazard, neighborhood, description, severity });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSending(true);
    const { error } = await supabase.from("reports").insert({
      user_id: user.id,
      hazard: parsed.data.hazard,
      neighborhood: parsed.data.neighborhood,
      description: parsed.data.description,
      severity: parsed.data.severity,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      status: "pendente",
    });
    setSending(false);
    if (error) {
      toast.error("Não foi possível enviar seu relato. Tente novamente.");
      return;
    }
    toast.success("Relato enviado! Ele aparecerá no mapa após a verificação.");
    setNeighborhood("");
    setDescription("");
    setCoords(null);
    queryClient.invalidateQueries({ queryKey: ["approved-reports"] });
    queryClient.invalidateQueries({ queryKey: ["map-data"] });
  };

  return (
    <section id="relatos" className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "300px" }}
          className="mb-12 text-center"
        >
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/15 mb-4">
            <MessageSquarePlus className="h-7 w-7 text-primary" />
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Relatos dos moradores
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Quem mora aqui sabe onde a água sobe primeiro. Envie o que aconteceu na sua rua
            e ajude a avisar os vizinhos.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Formulário */}
          <div className="lg:col-span-2">
            <div className="rounded-xl bg-card border border-border p-6 shadow-card">
              <h3 className="font-heading font-bold text-foreground mb-1">Enviar um relato</h3>
              <p className="text-xs text-muted-foreground mb-5 flex items-start gap-1.5">
                <ShieldCheck className="h-4 w-4 shrink-0 text-safe mt-0.5" />
                Seu relato é publicado de forma anônima. O cadastro serve apenas para
                evitar informações falsas.
              </p>

              {!user ? (
                <div className="rounded-lg bg-secondary p-5 text-center">
                  <UserRound className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-4">
                    É preciso ter uma conta para enviar relatos.
                  </p>
                  <Link
                    to="/auth"
                    className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110 transition"
                  >
                    Entrar ou criar conta
                  </Link>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Tipo de ocorrência
                    </label>
                    <select
                      value={hazard}
                      onChange={(e) => setHazard(e.target.value as typeof hazard)}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring"
                    >
                      {HAZARDS.map((h) => (
                        <option key={h.value} value={h.value}>
                          {h.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Bairro / rua
                    </label>
                    <input
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      maxLength={120}
                      placeholder="Ex.: Sumaré, Rua das Palmeiras"
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring"
                    />
                    <button
                      type="button"
                      onClick={locate}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      {coords
                        ? "Localização adicionada ✓"
                        : "Marcar minha localização no mapa (opcional)"}
                    </button>
                  </div>


                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Gravidade
                    </label>
                    <div className="flex gap-2">
                      {SEVERITY.map((s) => (
                        <button
                          key={s.value}
                          type="button"
                          onClick={() => setSeverity(s.value)}
                          className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                            severity === s.value
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      O que aconteceu
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      maxLength={1000}
                      rows={4}
                      placeholder="Descreva o local, a altura da água, horário e se houve danos."
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring resize-none"
                    />
                    <p className="mt-1 text-right text-xs text-muted-foreground">
                      {description.length}/1000
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-semibold text-primary-foreground hover:brightness-110 transition disabled:opacity-60"
                  >
                    {sending && <Loader2 className="h-4 w-4 animate-spin" />}
                    Enviar relato
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Lista */}
          <div className="lg:col-span-3">
            {isLoading && (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            )}

            {approved && approved.length === 0 && (
              <div className="rounded-xl border border-dashed border-border p-10 text-center">
                <p className="text-muted-foreground">
                  Ainda não há relatos verificados. Seja o primeiro a avisar a sua vizinhança.
                </p>
              </div>
            )}

            <div className="space-y-3">
              {approved?.map((r) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "300px" }}
                  className="rounded-xl bg-card border border-border p-5 shadow-card"
                >
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                      {HAZARDS.find((h) => h.value === r.hazard)?.label}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" /> {r.neighborhood}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(r.occurred_at).toLocaleDateString("pt-BR")}
                    </span>
                    <span className="ml-auto text-xs font-semibold text-alert-warning">
                      {severityLabel(r.severity)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{r.description}</p>
                  <p className="mt-2 text-xs text-muted-foreground">Relato anônimo verificado</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReportsSection;
