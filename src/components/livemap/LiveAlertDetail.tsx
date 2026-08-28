import { useState } from "react";
import { toast } from "sonner";
import { Flag, Loader2, ThumbsUp, TrendingDown, X, XCircle } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { useAuth } from "@/contexts/AuthContext";
import {
  confidenceBand,
  displayStatus,
  distanceMeters,
  kindMeta,
  relativeTime,
  severityMeta,
  type LiveAlert,
} from "@/lib/liveAlerts";
import { confirmLiveAlert, reportAlertAbuse, type ConfirmResponse } from "@/lib/liveAlertsApi";

interface Props {
  alert: LiveAlert;
  userPosition: { lat: number; lng: number } | null;
  onClose: () => void;
  onChanged: () => void;
}

const LiveAlertDetail = ({ alert, userPosition, onClose, onChanged }: Props) => {
  const { user } = useAuth();
  const [busy, setBusy] = useState<string | null>(null);
  const kind = kindMeta(alert.kind);
  const sev = severityMeta(alert.severity);
  const state = displayStatus(alert);

  const send = async (response: ConfirmResponse) => {
    if (!user) return;
    setBusy(response);
    try {
      await confirmLiveAlert({
        alertId: alert.id,
        userId: user.id,
        response,
        distanceM: userPosition
          ? Math.round(distanceMeters(userPosition.lat, userPosition.lng, alert.lat, alert.lng))
          : null,
      });
      toast.success("Obrigado! Sua confirmação atualizou o alerta.");
      onChanged();
    } catch {
      toast.error("Não foi possível registrar sua resposta. Tente novamente.");
    } finally {
      setBusy(null);
    }
  };

  const denounce = async () => {
    if (!user) return;
    setBusy("denuncia");
    try {
      await reportAlertAbuse({ alertId: alert.id, userId: user.id, reason: "conteudo_improprio" });
      toast.success("Denúncia enviada para a moderação.");
      onChanged();
    } catch {
      toast.error("Não foi possível enviar a denúncia.");
    } finally {
      setBusy(null);
    }
  };

  const btn =
    "inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:opacity-60";

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="mb-3 flex items-start gap-2">
        <span className="text-2xl leading-none" aria-hidden>
          {kind.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-heading font-bold text-foreground">{kind.label}</h3>
          <p className="text-xs text-muted-foreground">{alert.neighborhood || "Local aproximado"}</p>
        </div>
        <button onClick={onClose} aria-label="Fechar detalhe" className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span
          className="rounded-full px-3 py-1 text-xs font-bold text-white"
          style={{ background: sev.color }}
        >
          {sev.note}
        </span>
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
          Confiabilidade {confidenceBand(alert.confidence)}
        </span>
        {state === "esmaecendo" && (
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
            Não confirmado recentemente
          </span>
        )}
      </div>

      <p className="text-sm leading-relaxed text-foreground">{alert.description || kind.hint}</p>

      {alert.media_url && (
        <img
          src={alert.media_url}
          alt={`Registro enviado por morador sobre ${kind.label.toLowerCase()} em ${alert.neighborhood}`}
          loading="lazy"
          className="mt-3 w-full rounded-lg border border-border object-cover"
        />
      )}

      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div>
          <dt className="font-semibold text-foreground">Publicado</dt>
          <dd>{relativeTime(alert.created_at)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-foreground">Última confirmação</dt>
          <dd>{relativeTime(alert.last_confirmed_at)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-foreground">Confirmações</dt>
          <dd>{alert.confirm_count}</dd>
        </div>
        <div>
          <dt className="font-semibold text-foreground">Situação</dt>
          <dd>{state === "ativo" ? "Ativo no mapa" : "Perdendo validade"}</dd>
        </div>
      </dl>

      <p className="mt-3 text-xs font-semibold text-foreground">Você está passando por lá?</p>
      {user ? (
        <div className="mt-2 flex gap-2">
          <button
            className={`${btn} bg-primary text-primary-foreground hover:brightness-110`}
            disabled={busy !== null}
            onClick={() => send("continua")}
          >
            {busy === "continua" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ThumbsUp className="h-3.5 w-3.5" />}
            Continua
          </button>
          <button
            className={`${btn} bg-secondary text-foreground hover:brightness-95`}
            disabled={busy !== null}
            onClick={() => send("melhorou")}
          >
            <TrendingDown className="h-3.5 w-3.5" />
            Melhorou
          </button>
          <button
            className={`${btn} bg-secondary text-foreground hover:brightness-95`}
            disabled={busy !== null}
            onClick={() => send("nao_encontrado")}
          >
            <XCircle className="h-3.5 w-3.5" />
            Não achei
          </button>
        </div>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">
          <Link to="/auth" className="font-semibold text-primary hover:underline">
            Entre na sua conta
          </Link>{" "}
          para confirmar ou contestar este alerta.
        </p>
      )}

      {user && (
        <button
          onClick={denounce}
          disabled={busy !== null}
          className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <Flag className="h-3.5 w-3.5" /> Denunciar este relato
        </button>
      )}
    </div>
  );
};

export default LiveAlertDetail;
