import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Crosshair, Loader2, MapPin } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { useAuth } from "@/contexts/AuthContext";
import {
  ALERT_KINDS,
  SEVERITIES,
  type AlertKind,
  type AlertSeverity,
} from "@/lib/liveAlerts";
import { createLiveAlert } from "@/lib/liveAlertsApi";

const schema = z.object({
  neighborhood: z.string().trim().min(2, "Informe o bairro ou a rua").max(80),
  description: z.string().trim().max(600, "Máximo de 600 caracteres"),
  mediaUrl: z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === "" || /^https:\/\/\S+$/.test(v), "Use um endereço https válido")
    .optional(),
});

interface Props {
  /** Ponto escolhido no mapa (clique) ou obtido pela localização do usuário. */
  point: { lat: number; lng: number } | null;
  onPickOnMap: () => void;
  onUseMyLocation: () => void;
  pickingOnMap: boolean;
  onCreated: () => void;
}

const LiveAlertForm = ({ point, onPickOnMap, onUseMyLocation, pickingOnMap, onCreated }: Props) => {
  const { user } = useAuth();
  const [kind, setKind] = useState<AlertKind>("alagamento");
  const [severity, setSeverity] = useState<AlertSeverity>("moderado");
  const [neighborhood, setNeighborhood] = useState("");
  const [description, setDescription] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!point) {
      toast.error("Escolha o local no mapa ou use a sua localização.");
      return;
    }
    const parsed = schema.safeParse({ neighborhood, description, mediaUrl });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSending(true);
    try {
      await createLiveAlert({
        kind,
        severity,
        lat: point.lat,
        lng: point.lng,
        neighborhood: parsed.data.neighborhood,
        description: parsed.data.description,
        mediaUrl: parsed.data.mediaUrl || null,
        userId: user.id,
      });
      toast.success("Relato publicado no mapa. Obrigado por avisar a vizinhança!");
      setDescription("");
      setMediaUrl("");
      onCreated();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      toast.error(
        msg.includes("poucos minutos") || msg.includes("neste local")
          ? msg
          : "Não foi possível publicar o relato. Tente novamente em instantes.",
      );
    } finally {
      setSending(false);
    }
  };

  const field =
    "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring";

  if (!user) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center shadow-card">
        <MapPin className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
        <p className="mb-4 text-sm text-muted-foreground">
          É preciso ter uma conta para enviar relatos. Seu nome nunca aparece no mapa.
        </p>
        <Link
          to="/auth"
          className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110"
        >
          Entrar ou criar conta
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-card">
      <h3 className="font-heading font-bold text-foreground">Enviar um relato</h3>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">Tipo de ocorrência</label>
        <select className={field} value={kind} onChange={(e) => setKind(e.target.value as AlertKind)}>
          {ALERT_KINDS.map((k) => (
            <option key={k.value} value={k.value}>
              {k.emoji} {k.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">Nível de risco</label>
        <div className="grid grid-cols-4 gap-1.5">
          {SEVERITIES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setSeverity(s.value)}
              className={`rounded-lg px-2 py-2 text-xs font-semibold transition ${
                severity === s.value
                  ? "text-white"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
              style={severity === s.value ? { background: s.color } : undefined}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">Local</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onPickOnMap}
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition ${
              pickingOnMap ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
            }`}
          >
            <MapPin className="mr-1 inline h-3.5 w-3.5" />
            {pickingOnMap ? "Clique no mapa…" : "Escolher no mapa"}
          </button>
          <button
            type="button"
            onClick={onUseMyLocation}
            className="flex-1 rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-foreground"
          >
            <Crosshair className="mr-1 inline h-3.5 w-3.5" />
            Usar minha localização
          </button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {point
            ? `Ponto aproximado selecionado (${point.lat.toFixed(3)}, ${point.lng.toFixed(3)}).`
            : "Nenhum ponto selecionado ainda."}{" "}
          O local é arredondado em cerca de 100 m antes de ir ao mapa.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">Bairro / rua</label>
        <input
          className={field}
          maxLength={80}
          placeholder="Ex.: Indaiá, Rua das Palmeiras"
          value={neighborhood}
          onChange={(e) => setNeighborhood(e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">
          Descrição <span className="text-muted-foreground">(opcional)</span>
        </label>
        <textarea
          className={`${field} resize-none`}
          rows={3}
          maxLength={600}
          placeholder="O que você está vendo no local?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">
          Link de foto ou vídeo <span className="text-muted-foreground">(opcional)</span>
        </label>
        <input
          className={field}
          maxLength={500}
          placeholder="https://…"
          value={mediaUrl}
          onChange={(e) => setMediaUrl(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={sending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-60"
      >
        {sending && <Loader2 className="h-4 w-4 animate-spin" />}
        Enviar relato
      </button>
    </form>
  );
};

export default LiveAlertForm;
