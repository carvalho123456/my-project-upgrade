/**
 * Acesso a dados do mapa colaborativo.
 *
 * As tabelas do mapa colaborativo entram no banco quando este rascunho for
 * aceito, então as consultas usam um cliente sem tipagem gerada. A leitura
 * pública nunca pede a coluna de autoria (privacidade).
 */
import { supabase } from "@/integrations/supabase/client";
import type { AlertKind, AlertSeverity, LiveAlert } from "@/lib/liveAlerts";
import { roundPoint } from "@/lib/liveAlerts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

const PUBLIC_COLUMNS =
  "id, kind, severity, lat, lng, neighborhood, description, media_url, source, status, confirm_count, improved_count, notfound_count, confidence, created_at, last_confirmed_at, expires_at";

export const fetchLiveAlerts = async (): Promise<LiveAlert[]> => {
  const { data, error } = await db
    .from("live_alerts")
    .select(PUBLIC_COLUMNS)
    .eq("status", "ativo")
    .order("expires_at", { ascending: false })
    .limit(300);
  if (error) throw error;
  return (data ?? []) as LiveAlert[];
};

export interface NewAlertInput {
  kind: AlertKind;
  severity: AlertSeverity;
  lat: number;
  lng: number;
  neighborhood: string;
  description: string;
  mediaUrl?: string | null;
  userId: string;
}

export const createLiveAlert = async (input: NewAlertInput) => {
  const point = roundPoint(input.lat, input.lng);
  const { error } = await db.from("live_alerts").insert({
    kind: input.kind,
    severity: input.severity,
    lat: point.lat,
    lng: point.lng,
    neighborhood: input.neighborhood,
    description: input.description,
    media_url: input.mediaUrl ?? null,
    user_id: input.userId,
    source: "morador",
    status: "ativo",
  });
  if (error) throw error;
};

export type ConfirmResponse = "continua" | "melhorou" | "nao_encontrado";

export const confirmLiveAlert = async (params: {
  alertId: string;
  userId: string;
  response: ConfirmResponse;
  distanceM: number | null;
}) => {
  const { error } = await db.from("alert_confirmations").upsert(
    {
      alert_id: params.alertId,
      user_id: params.userId,
      response: params.response,
      distance_m: params.distanceM,
      created_at: new Date().toISOString(),
    },
    { onConflict: "alert_id,user_id" },
  );
  if (error) throw error;
};

export const reportAlertAbuse = async (params: {
  alertId: string;
  userId: string;
  reason: string;
}) => {
  const { error } = await db.from("alert_abuse_reports").insert({
    alert_id: params.alertId,
    user_id: params.userId,
    reason: params.reason,
  });
  if (error) throw error;
};
