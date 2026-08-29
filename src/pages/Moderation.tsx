import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@/lib/router-compat";
import { ArrowLeft, Check, X, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import LiveAlertsModeration from "@/components/livemap/LiveAlertsModeration";

const HAZARD_LABEL: Record<string, string> = {
  alagamento: "Alagamento",
  deslizamento: "Deslizamento",
  vendaval: "Vendaval",
  ressaca: "Ressaca",
  outro: "Outro",
};

const Moderation = () => {
  const { user, loading } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"relatos" | "colaborativo">("relatos");

  const { data: isModerator } = useQuery({
    queryKey: ["is-moderator", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id);
      if (error) throw error;
      return (data ?? []).some((r) => r.role === "admin" || r.role === "moderator");
    },
  });

  const { data: reports, isLoading } = useQuery({
    queryKey: ["all-reports"],
    enabled: !!isModerator,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reports")
        .select("id, hazard, neighborhood, description, severity, status, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const setStatus = async (id: string, status: "aprovado" | "rejeitado") => {
    const { error } = await supabase.from("reports").update({ status }).eq("id", id);
    if (error) {
      toast.error("Não foi possível atualizar o relato.");
      return;
    }
    toast.success(status === "aprovado" ? "Relato publicado." : "Relato rejeitado.");
    qc.invalidateQueries({ queryKey: ["all-reports"] });
    qc.invalidateQueries({ queryKey: ["approved-reports"] });
    qc.invalidateQueries({ queryKey: ["map-data"] });
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="container mx-auto max-w-3xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao site
        </Link>

        <h1 className="font-heading text-3xl font-bold text-foreground mb-6">
          Moderação de relatos
        </h1>

        {user && isModerator && (
          <div className="mb-6 flex gap-2">
            {(["relatos", "colaborativo"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  tab === t
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "relatos" ? "Relatos da comunidade" : "Mapa colaborativo"}
              </button>
            ))}
          </div>
        )}

        {!user || isModerator === false ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <ShieldAlert className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              Esta área é restrita à equipe de moderação.
            </p>
          </div>
        ) : tab === "colaborativo" ? (
          <LiveAlertsModeration />
        ) : isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        ) : (
          <div className="space-y-3">
            {reports?.length === 0 && (
              <p className="text-muted-foreground">Nenhum relato enviado ainda.</p>
            )}
            {reports?.map((r) => (
              <div key={r.id} className="rounded-xl border border-border bg-card p-5 shadow-card">
                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-primary/10 px-3 py-1 font-bold text-primary">
                    {HAZARD_LABEL[r.hazard]}
                  </span>
                  <span className="text-muted-foreground">{r.neighborhood}</span>
                  <span className="ml-auto font-semibold text-foreground">{r.status}</span>
                </div>
                <p className="text-sm text-foreground">{r.description}</p>
                {r.status !== "aprovado" && (
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => setStatus(r.id, "aprovado")}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-safe/15 px-3 py-1.5 text-sm font-semibold text-safe"
                    >
                      <Check className="h-4 w-4" /> Publicar
                    </button>
                    <button
                      onClick={() => setStatus(r.id, "rejeitado")}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-1.5 text-sm font-semibold text-destructive"
                    >
                      <X className="h-4 w-4" /> Rejeitar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Moderation;
