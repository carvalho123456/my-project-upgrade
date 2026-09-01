-- =====================================================================
-- Mapa colaborativo de ocorrências climáticas / urbanas
-- Tabelas: live_alerts, alert_confirmations, alert_abuse_reports, alert_audit_log
-- Regras: TTL por tipo, confiabilidade 0-100, anti-abuso, privacidade
-- =====================================================================

-- ---------- Tipos ----------
DO $$ BEGIN
  CREATE TYPE public.live_alert_kind AS ENUM (
    'alagamento',
    'deslizamento',
    'risco_deslizamento',
    'enxurrada',
    'queda_arvore',
    'queda_poste',
    'falta_energia',
    'rua_interditada',
    'danos_estruturais'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.live_alert_severity AS ENUM ('baixo','moderado','alto','critico');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.live_alert_status AS ENUM ('ativo','expirado','oculto');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.alert_confirm_response AS ENUM ('continua','melhorou','nao_encontrado');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------- Utilitários ----------

-- Prazo base (TTL) por tipo de ocorrência, contado a partir da última confirmação.
CREATE OR REPLACE FUNCTION public.live_alert_ttl(_kind public.live_alert_kind)
RETURNS interval
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE _kind
    WHEN 'enxurrada'          THEN interval '2 hours'
    WHEN 'alagamento'         THEN interval '4 hours'
    WHEN 'falta_energia'      THEN interval '8 hours'
    WHEN 'queda_arvore'       THEN interval '8 hours'
    WHEN 'queda_poste'        THEN interval '8 hours'
    WHEN 'rua_interditada'    THEN interval '12 hours'
    ELSE interval '48 hours'
  END
$$;

-- Distância aproximada em metros entre dois pontos (equirretangular; suficiente
-- para as escalas urbanas usadas aqui).
CREATE OR REPLACE FUNCTION public.approx_distance_m(
  _lat1 double precision, _lng1 double precision,
  _lat2 double precision, _lng2 double precision
) RETURNS double precision
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT 6371000 * sqrt(
    pow(radians(_lat2 - _lat1), 2) +
    pow(radians(_lng2 - _lng1) * cos(radians((_lat1 + _lat2) / 2)), 2)
  )
$$;

-- ---------- Tabela principal ----------
CREATE TABLE IF NOT EXISTS public.live_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind public.live_alert_kind NOT NULL,
  severity public.live_alert_severity NOT NULL DEFAULT 'moderado',
  -- Ponto público arredondado (~100 m). A coordenada exata nunca é gravada.
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  neighborhood text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  media_url text,
  -- Autoria fica apenas no banco, para moderação. Nunca exposta ao público.
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  source text NOT NULL DEFAULT 'morador',
  status public.live_alert_status NOT NULL DEFAULT 'ativo',
  confirm_count integer NOT NULL DEFAULT 0,
  improved_count integer NOT NULL DEFAULT 0,
  notfound_count integer NOT NULL DEFAULT 0,
  abuse_count integer NOT NULL DEFAULT 0,
  confidence smallint NOT NULL DEFAULT 25,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_confirmed_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '4 hours'
);

CREATE INDEX IF NOT EXISTS live_alerts_visible_idx
  ON public.live_alerts (status, expires_at DESC);

-- Leitura pública SEM a coluna user_id (privacidade por coluna).
GRANT SELECT (
  id, kind, severity, lat, lng, neighborhood, description, media_url, source,
  status, confirm_count, improved_count, notfound_count, confidence,
  created_at, last_confirmed_at, expires_at
) ON public.live_alerts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.live_alerts TO authenticated;
GRANT ALL ON public.live_alerts TO service_role;

ALTER TABLE public.live_alerts ENABLE ROW LEVEL SECURITY;

-- Visível enquanto ativo e dentro de 2x o prazo (fase "esmaecendo" inclusa).
CREATE POLICY "Alertas ativos são públicos"
  ON public.live_alerts FOR SELECT TO anon, authenticated
  USING (
    status = 'ativo'
    AND now() < expires_at + public.live_alert_ttl(kind)
  );

CREATE POLICY "Autor vê os próprios alertas"
  ON public.live_alerts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Moderadores veem todos os alertas"
  ON public.live_alerts FOR SELECT TO authenticated
  USING (public.is_moderator(auth.uid()));

CREATE POLICY "Usuários autenticados criam alertas"
  ON public.live_alerts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'ativo' AND source = 'morador');

CREATE POLICY "Autor remove o próprio alerta"
  ON public.live_alerts FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Moderadores atualizam alertas"
  ON public.live_alerts FOR UPDATE TO authenticated
  USING (public.is_moderator(auth.uid()))
  WITH CHECK (public.is_moderator(auth.uid()));

CREATE POLICY "Moderadores removem alertas"
  ON public.live_alerts FOR DELETE TO authenticated
  USING (public.is_moderator(auth.uid()));

-- ---------- Confirmações coletivas ----------
CREATE TABLE IF NOT EXISTS public.alert_confirmations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id uuid NOT NULL REFERENCES public.live_alerts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  response public.alert_confirm_response NOT NULL,
  distance_m double precision,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (alert_id, user_id)
);

CREATE INDEX IF NOT EXISTS alert_confirmations_alert_idx
  ON public.alert_confirmations (alert_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE ON public.alert_confirmations TO authenticated;
GRANT ALL ON public.alert_confirmations TO service_role;

ALTER TABLE public.alert_confirmations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário vê as próprias confirmações"
  ON public.alert_confirmations FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_moderator(auth.uid()));

CREATE POLICY "Usuário confirma uma vez"
  ON public.alert_confirmations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuário altera a própria resposta"
  ON public.alert_confirmations FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------- Denúncias ----------
CREATE TABLE IF NOT EXISTS public.alert_abuse_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id uuid NOT NULL REFERENCES public.live_alerts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL DEFAULT '',
  reviewed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (alert_id, user_id)
);

GRANT SELECT, INSERT ON public.alert_abuse_reports TO authenticated;
GRANT ALL ON public.alert_abuse_reports TO service_role;

ALTER TABLE public.alert_abuse_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário vê as próprias denúncias"
  ON public.alert_abuse_reports FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_moderator(auth.uid()));

CREATE POLICY "Usuário denuncia um alerta"
  ON public.alert_abuse_reports FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ---------- Histórico ----------
CREATE TABLE IF NOT EXISTS public.alert_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id uuid REFERENCES public.live_alerts(id) ON DELETE CASCADE,
  actor_id uuid,
  action text NOT NULL,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.alert_audit_log TO authenticated;
GRANT ALL ON public.alert_audit_log TO service_role;

ALTER TABLE public.alert_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Moderadores leem o histórico"
  ON public.alert_audit_log FOR SELECT TO authenticated
  USING (public.is_moderator(auth.uid()));

-- =====================================================================
-- Regras de negócio
-- =====================================================================

-- Confiabilidade 0-100: recência + independência + proximidade + consistência.
CREATE OR REPLACE FUNCTION public.recalc_live_alert(_alert_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  a public.live_alerts%ROWTYPE;
  score double precision := 20;   -- relato único, ainda não confirmado
  c record;
  last_ok timestamptz;
  n_continua int := 0;
  n_melhorou int := 0;
  n_nao int := 0;
  ttl interval;
BEGIN
  SELECT * INTO a FROM public.live_alerts WHERE id = _alert_id;
  IF NOT FOUND THEN RETURN; END IF;
  ttl := public.live_alert_ttl(a.kind);
  last_ok := a.created_at;

  FOR c IN
    SELECT response, distance_m, created_at
    FROM public.alert_confirmations
    WHERE alert_id = _alert_id
  LOOP
    DECLARE
      -- recência: 1.0 agora, decaindo até ~0 ao fim do prazo
      w_time double precision := greatest(
        0,
        1 - (EXTRACT(EPOCH FROM (now() - c.created_at)) / EXTRACT(EPOCH FROM ttl))
      );
      -- proximidade: perto pesa mais; confirmação remota vale metade
      w_dist double precision := CASE
        WHEN c.distance_m IS NULL THEN 0.6
        WHEN c.distance_m <= 300 THEN 1.0
        WHEN c.distance_m <= 1500 THEN 0.75
        ELSE 0.45
      END;
    BEGIN
      IF c.response = 'continua' THEN
        n_continua := n_continua + 1;
        score := score + 22 * w_time * w_dist;
        IF c.created_at > last_ok THEN last_ok := c.created_at; END IF;
      ELSIF c.response = 'melhorou' THEN
        n_melhorou := n_melhorou + 1;
        score := score - 8 * w_time * w_dist;
      ELSE
        n_nao := n_nao + 1;
        score := score - 25 * w_time * w_dist;
      END IF;
    END;
  END LOOP;

  UPDATE public.live_alerts SET
    confirm_count = n_continua,
    improved_count = n_melhorou,
    notfound_count = n_nao,
    confidence = greatest(0, least(100, round(score)))::smallint,
    last_confirmed_at = last_ok,
    -- "melhorou" encurta o prazo pela metade
    expires_at = last_ok + CASE WHEN n_melhorou > n_continua THEN ttl / 2 ELSE ttl END,
    -- duas respostas independentes de "não encontrado" derrubam o alerta
    status = CASE
      WHEN status = 'oculto' THEN 'oculto'
      WHEN n_nao >= 2 AND n_nao > n_continua THEN 'expirado'
      ELSE status
    END
  WHERE id = _alert_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.on_alert_confirmation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.recalc_live_alert(NEW.alert_id);
  INSERT INTO public.alert_audit_log (alert_id, actor_id, action, detail)
  VALUES (NEW.alert_id, NEW.user_id, 'confirmacao',
          jsonb_build_object('response', NEW.response, 'distance_m', NEW.distance_m));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS alert_confirmations_recalc ON public.alert_confirmations;
CREATE TRIGGER alert_confirmations_recalc
AFTER INSERT OR UPDATE ON public.alert_confirmations
FOR EACH ROW EXECUTE FUNCTION public.on_alert_confirmation();

-- Anti-abuso + arredondamento do ponto na criação do alerta.
CREATE OR REPLACE FUNCTION public.before_live_alert_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent int;
BEGIN
  -- privacidade: ponto público arredondado (~100 m)
  NEW.lat := round(NEW.lat::numeric, 3)::double precision;
  NEW.lng := round(NEW.lng::numeric, 3)::double precision;
  NEW.last_confirmed_at := now();
  NEW.expires_at := now() + public.live_alert_ttl(NEW.kind);
  NEW.confidence := CASE NEW.severity
    WHEN 'critico' THEN 30 WHEN 'alto' THEN 25 ELSE 20 END;

  IF NEW.user_id IS NOT NULL THEN
    -- 1 relato do mesmo tipo a cada 10 minutos
    SELECT count(*) INTO recent
    FROM public.live_alerts
    WHERE user_id = NEW.user_id AND kind = NEW.kind
      AND created_at > now() - interval '10 minutes';
    IF recent > 0 THEN
      RAISE EXCEPTION 'Você já enviou um relato desse tipo há poucos minutos.';
    END IF;

    -- no máximo 1 relato do mesmo tipo dentro de ~150 m
    SELECT count(*) INTO recent
    FROM public.live_alerts
    WHERE kind = NEW.kind AND user_id = NEW.user_id AND status = 'ativo'
      AND now() < expires_at
      AND public.approx_distance_m(lat, lng, NEW.lat, NEW.lng) < 150;
    IF recent > 0 THEN
      RAISE EXCEPTION 'Já existe um relato seu desse tipo neste local.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS live_alerts_before_insert ON public.live_alerts;
CREATE TRIGGER live_alerts_before_insert
BEFORE INSERT ON public.live_alerts
FOR EACH ROW EXECUTE FUNCTION public.before_live_alert_insert();

CREATE OR REPLACE FUNCTION public.after_live_alert_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.alert_audit_log (alert_id, actor_id, action, detail)
  VALUES (NEW.id, NEW.user_id, 'criacao',
          jsonb_build_object('kind', NEW.kind, 'severity', NEW.severity));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS live_alerts_after_insert ON public.live_alerts;
CREATE TRIGGER live_alerts_after_insert
AFTER INSERT ON public.live_alerts
FOR EACH ROW EXECUTE FUNCTION public.after_live_alert_insert();

-- Denúncias: contabiliza e oculta automaticamente a partir de 3 denúncias.
CREATE OR REPLACE FUNCTION public.on_alert_abuse_report()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.live_alerts
  SET abuse_count = abuse_count + 1,
      status = CASE WHEN abuse_count + 1 >= 3 THEN 'oculto'::public.live_alert_status ELSE status END
  WHERE id = NEW.alert_id;
  INSERT INTO public.alert_audit_log (alert_id, actor_id, action, detail)
  VALUES (NEW.alert_id, NEW.user_id, 'denuncia', jsonb_build_object('reason', NEW.reason));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS alert_abuse_reports_apply ON public.alert_abuse_reports;
CREATE TRIGGER alert_abuse_reports_apply
AFTER INSERT ON public.alert_abuse_reports
FOR EACH ROW EXECUTE FUNCTION public.on_alert_abuse_report();

-- Varredura de arquivamento (pode ser chamada por rotina agendada).
CREATE OR REPLACE FUNCTION public.expire_live_alerts()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE n int;
BEGIN
  UPDATE public.live_alerts
  SET status = 'expirado'
  WHERE status = 'ativo'
    AND now() > expires_at + public.live_alert_ttl(kind);
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END;
$$;

-- Tempo real
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.live_alerts;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =====================================================================
-- Dados simulados (Caraguatatuba) para o mapa nascer populado
-- =====================================================================
INSERT INTO public.live_alerts
  (kind, severity, lat, lng, neighborhood, description, source, confidence,
   confirm_count, created_at, last_confirmed_at, expires_at)
VALUES
  ('alagamento','critico',-23.6210,-45.4110,'Centro',
   'Água acima do meio-fio na Av. da Praia; trecho possivelmente intransitável.',
   'simulado',88,6, now() - interval '40 minutes', now() - interval '8 minutes', now() + interval '3 hours'),
  ('alagamento','moderado',-23.6335,-45.4062,'Indaiá',
   'Poças grandes perto da praça; passagem lenta para carros baixos.',
   'simulado',61,3, now() - interval '2 hours', now() - interval '35 minutes', now() + interval '3 hours'),
  ('risco_deslizamento','alto',-23.6402,-45.4290,'Rio do Ouro',
   'Barranco com trincas e terra caindo após a chuva da madrugada.',
   'simulado',74,4, now() - interval '5 hours', now() - interval '1 hour', now() + interval '46 hours'),
  ('deslizamento','critico',-23.6480,-45.4405,'Perequê-Mirim',
   'Deslizamento relatado sobre a via lateral; interdição relatada por moradores.',
   'simulado',80,5, now() - interval '9 hours', now() - interval '2 hours', now() + interval '44 hours'),
  ('queda_arvore','moderado',-23.6128,-45.3990,'Sumaré',
   'Árvore caída ocupando meia pista na rua principal.',
   'simulado',55,2, now() - interval '3 hours', now() - interval '50 minutes', now() + interval '7 hours'),
  ('queda_poste','alto',-23.6295,-45.4185,'Jardim Britânia',
   'Poste inclinado com fiação baixa; evite passar por baixo.',
   'simulado',66,3, now() - interval '4 hours', now() - interval '1 hour', now() + interval '7 hours'),
  ('falta_energia','moderado',-23.6172,-45.4048,'Martim de Sá',
   'Sem energia em várias ruas do bairro desde o temporal.',
   'simulado',58,3, now() - interval '6 hours', now() - interval '2 hours', now() + interval '6 hours'),
  ('rua_interditada','alto',-23.6250,-45.4322,'Tinga',
   'Interdição relatada por acúmulo de lama na pista.',
   'simulado',63,2, now() - interval '7 hours', now() - interval '3 hours', now() + interval '9 hours'),
  ('enxurrada','critico',-23.6362,-45.4230,'Travessão',
   'Correnteza forte na travessia do córrego; risco alto para pedestres.',
   'simulado',70,3, now() - interval '50 minutes', now() - interval '15 minutes', now() + interval '1 hour'),
  ('danos_estruturais','moderado',-23.6088,-45.3925,'Massaguaçu',
   'Muro de contenção com rachaduras visíveis após a chuva.',
   'simulado',48,1, now() - interval '20 hours', now() - interval '10 hours', now() + interval '38 hours');