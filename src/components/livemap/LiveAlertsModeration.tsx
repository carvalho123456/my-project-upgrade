import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { EyeOff, Loader2, Timer, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { kindMeta, relativeTime, severityMeta, type LiveAlert } from "@/lib/liveAlerts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

/** Aba de moderação dos alertas do mapa colaborativo. */
const LiveAlertsModeration = () => {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["moderation-live-alerts"],
    queryFn: async (): Promise<LiveAlert[]> => {
      const { data, error } = await db
        .from("live_alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as LiveAlert[];
    },
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["moderation-live-alerts"] });

  const hide = async (id: string) => {
    const { error } = await db.from("live_alerts").update({ status: "oculto" }).eq("id", id);
    if (error) return toast.error("Não foi possível ocultar o alerta.");
    toast.success("Alerta ocultado do mapa.");
    refresh();
  };

  const expire = async (id: string) => {
    const { error } = await db
      .from("live_alerts")
      .update({ status: "expirado", expires_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return toast.error("Não foi possível expirar o alerta.");
    toast.success("Alerta expirado.");
    refresh();
  };

  const remove = async (id: string) => {
    const { error } = await db.from("live_alerts").delete().eq("id", id);
    if (error) return toast.error("Não foi possível remover o alerta.");
    toast.success("Alerta removido.");
    refresh();
  };

  if (isLoading) return <Loader2 className="h-6 w-6 animate-spin text-primary" />;

  return (
    <div className="space-y-3">
      {(data ?? []).length === 0 && (
        <p className="text-muted-foreground">Nenhum alerta colaborativo registrado.</p>
      )}
      {(data ?? []).map((a) => {
        const kind = kindMeta(a.kind);
        const sev = severityMeta(a.severity);
        return (
          <div key={a.id} className="rounded-xl border border-border bg-card p-5 shadow-card">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-foreground">
                {kind.emoji} {kind.label}
              </span>
              <span className="rounded-full px-2 py-0.5 font-bold text-white" style={{ background: sev.color }}>
                {sev.label}
              </span>
              <span className="text-muted-foreground">{a.neighborhood}</span>
              <span className="text-muted-foreground">{relativeTime(a.created_at)}</span>
              <span className="ml-auto font-semibold text-foreground">{a.status}</span>
            </div>
            <p className="text-sm text-foreground">{a.description}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Confirmações: {a.confirm_count} • melhorou: {a.improved_count} • não encontrado:{" "}
              {a.notfound_count} • confiança: {a.confidence}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => hide(a.id)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-sm font-semibold text-foreground"
              >
                <EyeOff className="h-4 w-4" /> Ocultar
              </button>
              <button
                onClick={() => expire(a.id)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-sm font-semibold text-foreground"
              >
                <Timer className="h-4 w-4" /> Expirar
              </button>
              <button
                onClick={() => remove(a.id)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-1.5 text-sm font-semibold text-destructive"
              >
                <Trash2 className="h-4 w-4" /> Remover
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LiveAlertsModeration;
