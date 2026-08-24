-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_moderator(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin','moderator')
  )
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- SHARED updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  neighborhood text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- REPORTS
CREATE TYPE public.hazard_type AS ENUM ('alagamento', 'deslizamento', 'vendaval', 'ressaca', 'outro');
CREATE TYPE public.report_status AS ENUM ('pendente', 'aprovado', 'rejeitado');

CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hazard public.hazard_type NOT NULL,
  neighborhood text NOT NULL,
  description text NOT NULL,
  severity smallint NOT NULL DEFAULT 2,
  lat double precision,
  lng double precision,
  photo_url text,
  status public.report_status NOT NULL DEFAULT 'pendente',
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT reports_severity_range CHECK (severity BETWEEN 1 AND 3),
  CONSTRAINT reports_description_len CHECK (char_length(description) BETWEEN 10 AND 1000),
  CONSTRAINT reports_neighborhood_len CHECK (char_length(neighborhood) BETWEEN 2 AND 120)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reports"
  ON public.reports FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Moderators can view all reports"
  ON public.reports FOR SELECT TO authenticated USING (public.is_moderator(auth.uid()));
CREATE POLICY "Authenticated users can create reports"
  ON public.reports FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'pendente');
CREATE POLICY "Moderators can update reports"
  ON public.reports FOR UPDATE TO authenticated
  USING (public.is_moderator(auth.uid())) WITH CHECK (public.is_moderator(auth.uid()));
CREATE POLICY "Users can delete their own reports"
  ON public.reports FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Moderators can delete reports"
  ON public.reports FOR DELETE TO authenticated USING (public.is_moderator(auth.uid()));

CREATE TRIGGER reports_updated_at BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX reports_status_idx ON public.reports (status, created_at DESC);

-- RISK ZONES
CREATE TABLE public.risk_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  hazard public.hazard_type NOT NULL,
  risk_level text NOT NULL DEFAULT 'Alto',
  source text NOT NULL DEFAULT 'estudo',
  description text,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  radius_m integer NOT NULL DEFAULT 500,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.risk_zones TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.risk_zones TO authenticated;
GRANT ALL ON public.risk_zones TO service_role;
ALTER TABLE public.risk_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view risk zones"
  ON public.risk_zones FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Moderators manage risk zones"
  ON public.risk_zones FOR ALL TO authenticated
  USING (public.is_moderator(auth.uid())) WITH CHECK (public.is_moderator(auth.uid()));

-- TIMELINE
CREATE TABLE public.timeline_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  event_date date NOT NULL,
  summary text NOT NULL,
  image_url text,
  video_url text,
  source_url text,
  hazard public.hazard_type,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.timeline_events TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.timeline_events TO authenticated;
GRANT ALL ON public.timeline_events TO service_role;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view timeline events"
  ON public.timeline_events FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Moderators manage timeline events"
  ON public.timeline_events FOR ALL TO authenticated
  USING (public.is_moderator(auth.uid())) WITH CHECK (public.is_moderator(auth.uid()));

-- PUBLIC REPORTS VIEW + hardened grants
REVOKE SELECT ON public.reports FROM authenticated;
GRANT SELECT (id, hazard, neighborhood, description, severity, lat, lng, photo_url, status, occurred_at, created_at, updated_at)
  ON public.reports TO authenticated, anon;

CREATE POLICY "Anyone can view approved reports"
  ON public.reports FOR SELECT TO anon, authenticated
  USING (status = 'aprovado');

CREATE VIEW public.public_reports
WITH (security_invoker = on) AS
  SELECT id, hazard, neighborhood, description, severity, lat, lng, photo_url, occurred_at, created_at
  FROM public.reports
  WHERE status = 'aprovado';
GRANT SELECT ON public.public_reports TO anon, authenticated;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_moderator(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_moderator(uuid) TO authenticated;