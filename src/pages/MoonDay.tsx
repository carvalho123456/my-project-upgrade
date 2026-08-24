import { Link } from "@/lib/router-compat";
import { useParams } from "@tanstack/react-router";
import { ArrowLeft, Moon as MoonIcon, Compass, Waves, Anchor, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { MoonDisc, MoonCalendarCard } from "@/components/MoonSection";
import { moonIllumination, phaseName, moonAge } from "@/lib/moon";
import { getMoonTimes, moonAltitude, formatTime } from "@/lib/moonTimes";
import { LAT, LON } from "@/lib/weather";

const longDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const STORIES = [
  {
    Icon: Compass,
    title: "A bússola dos primeiros navegadores",
    text: "Antes do GPS, marinheiros mediam com o sextante a distância angular entre a Lua e certas estrelas — o chamado método das distâncias lunares. Como a Lua se move rápido no céu, ela funcionava como o ponteiro de um relógio celeste e permitia calcular a longitude no meio do oceano.",
  },
  {
    Icon: Waves,
    title: "Marés: o pulso da Lua no mar",
    text: "A atração da Lua puxa a água dos oceanos. Na Lua Nova e na Lua Cheia, Sol e Lua se somam e criam as marés de sizígia (as mais altas e mais baixas). Nos quartos, as forças se cancelam em parte e as marés ficam fracas — as de quadratura. Pescadores de Caraguatatuba ainda planejam saídas e cercos por esse ritmo.",
  },
  {
    Icon: Anchor,
    title: "Entrar na barra com a maré cheia",
    text: "Barcos maiores esperavam a preamar para cruzar bancos de areia e barras rasas sem encalhar. Saber a hora do nascer da Lua era saber, com boa aproximação, a hora da maré — por isso o horário lunar era anotado no diário de bordo junto com o vento.",
  },
  {
    Icon: Sparkles,
    title: "Noites de Lua Cheia, noites de navegação",
    text: "Com a Lua cheia alta, o mar fica prateado e a linha do horizonte visível: dava para navegar de noite perto da costa. Já nas noites de Lua Nova o céu escuro favorecia a orientação pelas estrelas, como o Cruzeiro do Sul, que aponta o sul aqui no Hemisfério Sul.",
  },
];

const MoonArc = ({ date }: { date: Date }) => {
  const t = getMoonTimes(date, LAT, LON);
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  // curva de altitude ao longo do dia — ponto mais alto para cima
  const pts: string[] = [];
  const W = 300;
  const maxAlt = Math.max(t.transitAltitude, 10);
  for (let i = 0; i <= 96; i++) {
    const time = new Date(start.getTime() + i * 15 * 60000);
    const alt = moonAltitude(time, LAT, LON);
    const x = 10 + (i / 96) * (W - 20);
    const y = 90 - Math.max(alt, -12) / maxAlt * 62;
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }

  const now = new Date();
  const sameDay = now.toDateString() === date.toDateString();
  const nowFrac = sameDay ? (now.getTime() - start.getTime()) / 86400000 : 0.5;
  const nowAlt = moonAltitude(sameDay ? now : new Date(start.getTime() + 43200000), LAT, LON);
  const nx = 10 + nowFrac * (W - 20);
  const ny = 90 - Math.max(nowAlt, -12) / maxAlt * 62;

  return (
    <div className="rounded-2xl bg-card border border-border shadow-card p-5">
      <p className="font-heading font-bold text-foreground mb-4">Nascer, ponto mais alto e ocaso da Lua</p>
      <svg viewBox="0 0 300 110" className="w-full h-32">
        <line x1="10" y1="90" x2="290" y2="90" stroke="hsl(var(--border))" strokeWidth="1" />
        <polyline points={pts.join(" ")} fill="none" stroke="hsl(var(--primary))" strokeWidth="2" />
        <circle cx={nx} cy={ny} r="6" fill="hsl(var(--sky))" />
      </svg>
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Nascer da lua</p>
          <p className="font-heading font-bold text-foreground">{formatTime(t.rise)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Ponto mais alto</p>
          <p className="font-heading font-bold text-foreground">{formatTime(t.transit)}</p>
          <p className="text-[11px] text-muted-foreground">{Math.round(t.transitAltitude)}° acima do horizonte</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Pôr da lua</p>
          <p className="font-heading font-bold text-foreground">{formatTime(t.set)}</p>
        </div>
      </div>
      {(t.alwaysUp || t.alwaysDown) && (
        <p className="text-xs text-muted-foreground mt-3">
          {t.alwaysUp ? "A Lua fica acima do horizonte o dia todo." : "A Lua não aparece acima do horizonte neste dia."}
        </p>
      )}
    </div>
  );
};

const MoonDay = () => {
  const { date = "" } = useParams({ strict: false }) as { date?: string };
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(date);
  const day = valid ? new Date(`${date}T12:00:00`) : new Date();
  const illum = Math.round(moonIllumination(day) * 100);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-28 pb-16">
        <Link
          to="/#lua"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para o calendário lunar
        </Link>

        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-1 capitalize">
          {longDate(valid ? date : new Date().toISOString().slice(0, 10))}
        </h1>
        <p className="text-muted-foreground mb-8">A Lua vista de Caraguatatuba</p>

        <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr] items-stretch mb-6">
          <div className="rounded-2xl bg-card border border-border shadow-card p-7 flex flex-col items-center text-center justify-center">
            <MoonDisc date={day} size={170} />
            <p className="font-heading text-2xl font-bold text-foreground mt-4">{phaseName(day)}</p>
            <p className="text-sm text-muted-foreground">
              {illum}% iluminada · {Math.floor(moonAge(day))} dias de idade lunar
            </p>
          </div>
          <MoonArc date={day} />
        </div>

        <h2 className="font-heading text-xl font-bold text-foreground mb-3 flex items-center gap-2">
          <MoonIcon className="h-5 w-5 text-primary" /> Histórias da Lua e dos marinheiros
        </h2>
        <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr] items-start">
          <div className="grid gap-4 sm:grid-cols-2">
            {STORIES.map(({ Icon, title, text }) => (
              <article key={title} className="rounded-2xl bg-card border border-border shadow-card p-5">
                <Icon className="h-5 w-5 text-primary mb-3" />
                <h3 className="font-heading font-bold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
              </article>
            ))}
          </div>
          <MoonCalendarCard compact />
        </div>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default MoonDay;
