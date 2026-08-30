import { useEffect, useState } from "react";
import { Link, useNavigate } from "@/lib/router-compat";
import { CloudRain, ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z.string().min(6, "A senha precisa ter ao menos 6 caracteres").max(72),
  displayName: z.string().trim().min(2, "Informe seu nome").max(60).optional(),
});

const AuthPage = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({
      email,
      password,
      displayName: mode === "signup" ? displayName : undefined,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: parsed.data.displayName },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setSent(true);
          toast.success("Conta criada! Confirme seu e-mail para entrar.");
        } else {
          toast.success("Conta criada com sucesso!");
          navigate("/");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (error) throw error;
        toast.success("Bem-vindo de volta!");
        navigate("/");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro inesperado";
      toast.error(
        msg.includes("Invalid login")
          ? "E-mail ou senha incorretos."
          : msg.includes("already registered")
            ? "Este e-mail já possui conta. Faça login."
            : msg,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hero flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-ocean-pale/80 hover:text-primary-foreground mb-6 text-sm"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao site
        </Link>

        <div className="rounded-2xl bg-card p-8 shadow-elevated border border-border">
          <div className="flex items-center gap-2 mb-6">
            <CloudRain className="h-7 w-7 text-primary" />
            <span className="font-heading text-xl font-bold text-foreground">Clima Caragua</span>
          </div>

          <h1 className="font-heading text-2xl font-bold text-foreground mb-2">
            {mode === "login" ? "Entrar na sua conta" : "Criar conta"}
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            A conta é necessária para enviar relatos de alagamento e salvar suas
            preferências. Seu nome nunca aparece publicamente nos relatos.
          </p>

          {sent ? (
            <p className="rounded-lg bg-safe/10 p-4 text-sm text-foreground">
              Enviamos um link de confirmação para <strong>{email}</strong>. Abra seu
              e-mail para ativar a conta.
            </p>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Nome</label>
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    maxLength={60}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Como podemos te chamar"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={255}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring"
                  placeholder="voce@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Senha</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    maxLength={72}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 pr-10 text-foreground outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Mínimo de 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground transition"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-semibold text-primary-foreground hover:brightness-110 transition disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {mode === "login" ? "Entrar" : "Criar conta"}
              </button>
            </form>
          )}

          <button
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setSent(false);
            }}
            className="mt-6 w-full text-sm text-muted-foreground hover:text-foreground"
          >
            {mode === "login"
              ? "Ainda não tem conta? Cadastre-se"
              : "Já tem conta? Faça login"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
