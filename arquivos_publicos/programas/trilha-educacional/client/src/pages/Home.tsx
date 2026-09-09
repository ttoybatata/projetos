import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  Flame,
  GraduationCap,
  Lightbulb,
  Menu,
  MessageCircle,
  Play,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

const initialSkills = [
  {
    name: "Equações do 2º grau",
    subject: "Matemática",
    value: 68,
    color: "teal",
  },
  {
    name: "Interpretação de texto",
    subject: "Linguagens",
    value: 82,
    color: "amber",
  },
  { name: "Ecossistemas", subject: "Ciências", value: 54, color: "blue" },
];

const prompts = [
  "Me dá uma dica sem resolver por mim",
  "Explica delta de um jeito mais simples",
  "Cria um exemplo parecido para eu praticar",
];

function Logo() {
  return (
    <a
      href="#inicio"
      className="flex items-center gap-3 text-[#102a43]"
      aria-label="Trilha, início"
    >
      <span className="relative grid size-9 place-items-center rounded-[13px] bg-[#087f8c] text-white shadow-[4px_4px_0_#f4b942]">
        <span className="absolute -right-1 -top-1 size-2 rounded-full bg-[#f4b942]" />
        <Sparkles className="size-4" strokeWidth={2.6} />
      </span>
      <span className="font-display text-2xl font-semibold tracking-[-0.06em]">
        trilha
      </span>
    </a>
  );
}

function SectionEyebrow({
  children,
  dark = false,
}: {
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <div
      className={`mb-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] ${dark ? "text-[#8ddbd5]" : "text-[#087f8c]"}`}
    >
      <span
        className={`size-2 rounded-full ${dark ? "bg-[#f4b942]" : "bg-[#f4b942]"}`}
      />
      {children}
    </div>
  );
}

function ProgressRing({ value }: { value: number }) {
  const radius = 33;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative size-[88px] shrink-0">
      <svg viewBox="0 0 88 88" className="size-full -rotate-90">
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke="#dce8e8"
          strokeWidth="7"
        />
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke="#087f8c"
          strokeLinecap="round"
          strokeWidth="7"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-lg font-bold text-[#102a43]">
        {value}%
      </span>
    </div>
  );
}

export default function Home() {
  const { user: authUser, logout } = useAuth();
  const studentStateQuery = trpc.student.state.useQuery(undefined, {
    enabled: Boolean(authUser),
    retry: false,
  });
  const completeDiagnosticMutation =
    trpc.student.completeDiagnostic.useMutation();
  const [entryMode, setEntryMode] = useState<
    "welcome" | "login" | "signup" | "onboarding"
  >("welcome");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [diagnosticComplete, setDiagnosticComplete] = useState(false);
  const [localPlan, setLocalPlan] = useState<LocalPlan | undefined>();
  const [profile, setProfile] = useState<StudentProfile>(() => {
    try {
      return JSON.parse(
        localStorage.getItem("trilha_profile") ||
          '{"name":"","email":"","grade":"","goal":""}'
      );
    } catch {
      return { name: "", email: "", grade: "", goal: "" };
    }
  });
  const [skills, setSkills] = useState(initialSkills);
  const [activeSkill, setActiveSkill] = useState(0);
  const [isMentorOpen, setIsMentorOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [mentorMessages, setMentorMessages] = useState([
    {
      role: "mentor",
      text: "Oi! Vi que você está revisando o discriminante. Quer uma dica, um exemplo ou prefere me contar onde travou?",
    },
  ]);
  const [input, setInput] = useState("");
  useEffect(() => {
    localStorage.setItem("trilha_profile", JSON.stringify(profile));
  }, [profile]);
  useEffect(() => {
    if (!authUser) return;
    setIsAuthenticated(true);
    const remote = studentStateQuery.data?.profile;
    if (remote) {
      setProfile({
        name: remote.name,
        email: remote.email,
        grade: remote.grade || "",
        goal: remote.goal || "",
      });
      setDiagnosticComplete(Boolean(remote.diagnosticCompletedAt));
    }
  }, [authUser, studentStateQuery.data]);

  const active = skills[activeSkill];
  const totalProgress = useMemo(
    () =>
      Math.round(
        skills.reduce((sum, item) => sum + item.value, 0) / skills.length
      ),
    [skills]
  );

  function finishLesson() {
    setCompleted(true);
    setSkills(current =>
      current.map((skill, index) =>
        index === 0
          ? { ...skill, value: Math.min(100, skill.value + 6) }
          : skill
      )
    );
  }

  function sendMentorMessage(message = input) {
    const clean = message.trim();
    if (!clean) return;
    setMentorMessages(current => [
      ...current,
      { role: "student", text: clean },
      {
        role: "mentor",
        text: "Vamos por partes: qual é o valor de a, b e c nessa equação? Depois, substituímos na fórmula Δ = b² − 4ac e conferimos o sinal com calma.",
      },
    ]);
    setInput("");
  }

  if (!isAuthenticated) {
    if (entryMode === "welcome") {
      return (
        <WelcomeScreen
          onLogin={() => setEntryMode("login")}
          onSignup={() => setEntryMode("signup")}
        />
      );
    }
    if (entryMode === "onboarding") {
      return (
        <OnboardingScreen
          initialProfile={profile}
          onComplete={(updatedProfile, result) => {
            const weakest =
              Object.entries(result.subjectScores).sort(
                ([, a], [, b]) => a - b
              )[0]?.[0] || "Matemática";
            setProfile(updatedProfile);
            setDiagnosticComplete(true);
            setLocalPlan({
              plan: {
                title: `Plano de 5 dias para ${updatedProfile.grade}`,
                summary: `Prioridade em ${weakest}, com atividades escolhidas a partir dos seus resultados.`,
                weeklyMinutes: 105,
              },
              planItems: planPreview(result, updatedProfile.grade).map(
                (item, index) => ({
                  dayOrder: index + 1,
                  subject:
                    item.kind === "Simulado" ? "Múltiplas áreas" : weakest,
                  title: item.title,
                  activityKind: item.kind.toLowerCase(),
                  durationMinutes: item.minutes,
                  rationale: "Selecionado a partir do diagnóstico inicial.",
                  completed: 0,
                })
              ),
            });
            setIsAuthenticated(true);
            if (authUser) {
              completeDiagnosticMutation.mutate({
                ...updatedProfile,
                ...result,
              });
            }
          }}
        />
      );
    }
    return (
      <EntryScreen
        mode={entryMode}
        onBack={() => setEntryMode("welcome")}
        onSwitch={next => setEntryMode(next)}
        onComplete={(mode, submittedProfile) => {
          setProfile(submittedProfile);
          if (mode === "signup") setEntryMode("onboarding");
          else setIsAuthenticated(true);
        }}
      />
    );
  }

  return (
    <DashboardExperience
      hasDiagnostic={diagnosticComplete}
      profile={profile}
      onProfileChange={setProfile}
      remoteState={studentStateQuery.data}
      localPlan={localPlan}
      canPersist={Boolean(authUser)}
      onLogout={async () => {
        await logout();
        setIsAuthenticated(false);
        setDiagnosticComplete(false);
        setLocalPlan(undefined);
        setEntryMode("welcome");
      }}
    />
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7fafc] text-[#19324a] selection:bg-[#f4b942] selection:text-[#102a43]">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-[#dbe7eb]/80 bg-[#f7fafc]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 lg:px-8">
          <Logo />
          <nav
            className={`absolute left-5 right-5 top-[86px] flex-col gap-2 rounded-2xl border border-[#d7e3eb] bg-white p-3 shadow-xl md:static md:flex md:flex-row md:items-center md:gap-7 md:border-0 md:bg-transparent md:p-0 md:shadow-none ${isMenuOpen ? "flex" : "hidden"}`}
          >
            <a
              className="nav-link"
              href="#visao"
              onClick={() => setIsMenuOpen(false)}
            >
              Visão geral
            </a>
            <a
              className="nav-link"
              href="#metodo"
              onClick={() => setIsMenuOpen(false)}
            >
              Como funciona
            </a>
            <a
              className="nav-link"
              href="#recursos"
              onClick={() => setIsMenuOpen(false)}
            >
              Recursos
            </a>
            <a
              className="nav-link"
              href="#painel"
              onClick={() => setIsMenuOpen(false)}
            >
              Seu painel
            </a>
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <button
              className="text-sm font-bold text-[#5c7185] transition hover:text-[#087f8c]"
              onClick={() => setIsMentorOpen(true)}
            >
              Entrar
            </button>
            <a
              href="#painel"
              className="rounded-xl bg-[#102a43] px-4 py-2.5 text-sm font-bold text-white shadow-[0_4px_0_#087f8c] transition hover:-translate-y-0.5"
            >
              Começar agora
            </a>
          </div>
          <button
            className="grid size-10 place-items-center rounded-xl border border-[#d7e3eb] text-[#102a43] md:hidden"
            onClick={() => setIsMenuOpen(current => !current)}
            aria-label="Abrir menu"
          >
            {isMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </div>
      </header>

      <main id="inicio">
        <section className="relative isolate overflow-hidden bg-[#102a43] pt-[76px] text-white">
          <div className="hero-grid absolute inset-0 opacity-40" />
          <div className="absolute -right-28 top-24 size-80 rounded-full border-[32px] border-[#087f8c]/30" />
          <div className="absolute -bottom-36 left-1/2 size-96 -translate-x-1/2 rounded-full border-[44px] border-[#f4b942]/10" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-20 lg:grid-cols-[1.02fr_.98fr] lg:px-8 lg:pb-28 lg:pt-28">
            <div className="max-w-2xl">
              <SectionEyebrow dark>
                Aprendizagem que acompanha você
              </SectionEyebrow>
              <h1 className="font-display text-[clamp(3.5rem,7vw,6.8rem)] font-medium leading-[0.91] tracking-[-0.075em] text-white">
                Seu próximo passo começa{" "}
                <em className="text-[#f4b942]">aqui.</em>
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-[#c6d5df]">
                Uma jornada de estudos que entende o que você já sabe, encontra
                o que falta e transforma cada sessão em avanço de verdade.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <a
                  href="#painel"
                  className="group inline-flex items-center gap-3 rounded-xl bg-[#f4b942] px-5 py-3.5 font-bold text-[#102a43] shadow-[0_5px_0_#b87517] transition hover:-translate-y-0.5"
                >
                  Conhecer meu caminho{" "}
                  <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                </a>
                <button
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-3.5 font-bold text-white transition hover:bg-white/10"
                  onClick={() => setIsMentorOpen(true)}
                >
                  <span className="grid size-7 place-items-center rounded-full border border-white/40">
                    <Play className="size-3 fill-current" />
                  </span>{" "}
                  Ver como funciona
                </button>
              </div>
              <div className="mt-12 flex items-center gap-4 text-sm text-[#c6d5df]">
                <div className="flex -space-x-2">
                  <span className="avatar bg-[#f0b29c]">AM</span>
                  <span className="avatar bg-[#9ddbd3]">LC</span>
                  <span className="avatar bg-[#d9b3f3]">JR</span>
                </div>
                <span>
                  <strong className="text-white">Aprenda sem comparação</strong>
                  <br />
                  já estão na trilha
                </span>
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-[560px] lg:ml-auto">
              <div className="absolute -left-3 top-10 z-10 hidden rounded-2xl border border-[#d7e3eb] bg-white p-4 text-[#19324a] shadow-xl sm:block lg:-left-8">
                <div className="mb-2 flex items-center gap-2 text-xs font-bold text-[#5c7185]">
                  <span className="size-2 rounded-full bg-[#087f8c]" /> SESSÃO
                  CONCLUÍDA
                </div>
                <div className="flex items-center gap-2 text-sm font-bold">
                  <CheckCircle2 className="size-5 text-[#087f8c]" /> 25 min de
                  foco
                </div>
              </div>
              <div className="dashboard-float relative rounded-[26px] border border-white/20 bg-[#eef6f5] p-4 text-[#19324a] shadow-2xl sm:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[.16em] text-[#5c7185]">
                      Quarta, 08 maio
                    </p>
                    <h3 className="mt-1 font-display text-2xl font-medium tracking-[-.04em]">
                      Olá, estudante <span>✦</span>
                    </h3>
                  </div>
                  <div className="grid size-10 place-items-center rounded-full bg-[#102a43] text-xs font-bold text-white">
                    {profile.name
                      ? profile.name
                          .split(" ")
                          .map(part => part[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()
                      : "?"}
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-[1.25fr_.75fr]">
                  <div className="rounded-2xl bg-[#102a43] p-5 text-white">
                    <div className="mb-10 flex items-start justify-between">
                      <span className="rounded-full bg-[#f4b942] px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-[#102a43]">
                        Recomendado
                      </span>
                      <Sparkles className="size-5 text-[#f4b942]" />
                    </div>
                    <p className="text-sm text-[#aac0cd]">Seu próximo passo</p>
                    <h4 className="mt-1 text-xl font-bold">
                      Equações do 2º grau
                    </h4>
                    <div className="mt-5 flex items-center justify-between">
                      <span className="text-xs text-[#aac0cd]">
                        ~20 min · Matemática
                      </span>
                      <span className="grid size-9 place-items-center rounded-full bg-[#087f8c]">
                        <ArrowRight className="size-4" />
                      </span>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white p-5">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#5c7185]">
                      Domínio geral
                    </p>
                    <div className="mt-4 flex justify-center">
                      <ProgressRing value={totalProgress} />
                    </div>
                    <p className="mt-3 text-center text-xs text-[#5c7185]">
                      +8% esta semana
                    </p>
                  </div>
                </div>
                <div className="mt-3 rounded-2xl bg-white p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="font-bold">Mapa de competências</p>
                    <span className="text-xs font-bold text-[#087f8c]">
                      Ver tudo <ChevronRight className="inline size-3" />
                    </span>
                  </div>
                  {skills.map(skill => (
                    <div key={skill.name} className="mb-3 last:mb-0">
                      <div className="mb-1.5 flex justify-between text-xs font-semibold">
                        <span>{skill.name}</span>
                        <span className="text-[#5c7185]">{skill.value}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[#e8eff1]">
                        <div
                          className={`h-full rounded-full ${skill.color === "amber" ? "bg-[#f4b942]" : skill.color === "blue" ? "bg-[#6b9bc5]" : "bg-[#087f8c]"}`}
                          style={{ width: `${skill.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="relative mx-auto flex max-w-7xl items-center gap-3 px-5 pb-5 text-xs text-[#8ca4b3] lg:px-8">
            <span className="size-1.5 rounded-full bg-[#f4b942]" /> Projetada
            para quem quer aprender com mais intenção.
          </div>
        </section>

        <section
          id="visao"
          className="bg-[#f7fafc] px-5 py-24 lg:px-8 lg:py-32"
        >
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-24">
              <div>
                <SectionEyebrow>Não é só conteúdo</SectionEyebrow>
                <h2 className="max-w-md font-display text-5xl font-medium leading-[.98] tracking-[-.07em] text-[#102a43] sm:text-6xl">
                  É um jeito mais{" "}
                  <span className="text-[#087f8c]">inteligente</span> de
                  continuar.
                </h2>
              </div>
              <div className="grid gap-8 sm:grid-cols-3">
                <div className="border-t-2 border-[#087f8c] pt-5">
                  <span className="mb-8 grid size-11 place-items-center rounded-2xl bg-[#dff5f3] text-[#087f8c]">
                    <BrainCircuit className="size-5" />
                  </span>
                  <h3 className="text-lg font-bold text-[#102a43]">
                    Personalizada
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[#5c7185]">
                    Seu ritmo, suas lacunas, sua próxima melhor atividade.
                  </p>
                </div>
                <div className="border-t-2 border-[#f4b942] pt-5">
                  <span className="mb-8 grid size-11 place-items-center rounded-2xl bg-[#fff3d6] text-[#bd7418]">
                    <Target className="size-5" />
                  </span>
                  <h3 className="text-lg font-bold text-[#102a43]">
                    Com propósito
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[#5c7185]">
                    Menos lista infinita. Mais clareza sobre onde chegar.
                  </p>
                </div>
                <div className="border-t-2 border-[#102a43] pt-5">
                  <span className="mb-8 grid size-11 place-items-center rounded-2xl bg-[#dbeafe] text-[#102a43]">
                    <TrendingUp className="size-5" />
                  </span>
                  <h3 className="text-lg font-bold text-[#102a43]">
                    Que evolui
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[#5c7185]">
                    Cada tentativa vira feedback para a próxima escolha.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="metodo"
          className="bg-[#eaf4f3] px-5 py-24 lg:px-8 lg:py-32"
        >
          <div className="mx-auto max-w-7xl">
            <div className="grid items-end gap-8 lg:grid-cols-[.8fr_1.2fr]">
              <div>
                <SectionEyebrow>Como funciona</SectionEyebrow>
                <h2 className="font-display text-5xl font-medium leading-[.98] tracking-[-.07em] text-[#102a43] sm:text-6xl">
                  Aprender fica mais leve quando o caminho aparece.
                </h2>
              </div>
              <p className="max-w-md pb-1 text-base leading-7 text-[#5c7185]">
                A Trilha organiza o que acontece antes, durante e depois de cada
                estudo — para você gastar menos energia decidindo e mais energia
                aprendendo.
              </p>
            </div>
            <div className="mt-16 grid gap-4 md:grid-cols-3">
              <div className="step-card">
                <span>01</span>
                <div className="step-icon">
                  <CompassIcon />
                </div>
                <h3>Descobrir</h3>
                <p>
                  Um diagnóstico inicial encontra suas forças e os pontos que
                  merecem atenção.
                </p>
              </div>
              <div className="step-card step-card-featured">
                <span>02</span>
                <div className="step-icon">
                  <Lightbulb className="size-6" />
                </div>
                <h3>Entender</h3>
                <p>
                  Aulas curtas, exemplos claros e prática guiada no ponto certo
                  da dificuldade.
                </p>
                <a href="#painel">
                  Ver uma aula <ArrowRight className="size-4" />
                </a>
              </div>
              <div className="step-card">
                <span>03</span>
                <div className="step-icon">
                  <Zap className="size-6" />
                </div>
                <h3>Avançar</h3>
                <p>
                  O seu histórico vira a próxima recomendação, revisão e meta da
                  semana.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="painel"
          className="bg-[#102a43] px-5 py-24 text-white lg:px-8 lg:py-32"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <SectionEyebrow dark>Uma amostra do seu painel</SectionEyebrow>
                <h2 className="font-display text-5xl font-medium leading-[.98] tracking-[-.07em] text-white sm:text-6xl">
                  Hoje você pode avançar em{" "}
                  <em className="text-[#f4b942]">uma coisa.</em>
                </h2>
              </div>
              <p className="max-w-xs text-sm leading-6 text-[#aac0cd]">
                Nada de se perder em mil abas. A Trilha destaca o que mais
                importa agora.
              </p>
            </div>
            <div className="grid gap-5 lg:grid-cols-[1.3fr_.7fr]">
              <div className="rounded-[26px] bg-[#f7fafc] p-5 text-[#19324a] sm:p-7">
                <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[.16em] text-[#5c7185]">
                      Próxima atividade recomendada
                    </p>
                    <h3 className="mt-2 text-2xl font-bold text-[#102a43]">
                      Reforço rápido: discriminante
                    </h3>
                  </div>
                  <span className="rounded-full bg-[#fff3d6] px-3 py-1.5 text-xs font-bold text-[#bd7418]">
                    Matemática
                  </span>
                </div>
                <div className="grid gap-5 sm:grid-cols-[1fr_1fr]">
                  <div className="rounded-2xl bg-[#dff5f3] p-5">
                    <div className="flex items-center justify-between">
                      <span className="grid size-11 place-items-center rounded-xl bg-[#087f8c] text-white">
                        <BookOpen className="size-5" />
                      </span>
                      <span className="text-sm font-bold text-[#087f8c]">
                        20 min
                      </span>
                    </div>
                    <h4 className="mt-8 text-xl font-bold text-[#102a43]">
                      Equações do 2º grau
                    </h4>
                    <p className="mt-2 text-sm leading-6 text-[#5c7185]">
                      Revise como o valor de Δ muda as raízes da equação.
                    </p>
                    <button
                      onClick={finishLesson}
                      className={`mt-6 inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${completed ? "bg-[#087f8c] text-white" : "bg-[#102a43] text-white hover:bg-[#173d5d]"}`}
                    >
                      {completed ? (
                        <>
                          <Check className="size-4" /> Concluído
                        </>
                      ) : (
                        <>
                          Começar agora <ArrowRight className="size-4" />
                        </>
                      )}
                    </button>
                  </div>
                  <div className="rounded-2xl border border-[#d7e3eb] p-5">
                    <div className="flex items-center gap-2 text-sm font-bold text-[#102a43]">
                      <Flame className="size-4 text-[#bd7418]" /> Sua sequência
                    </div>
                    <p className="mt-5 font-display text-5xl font-medium tracking-[-.06em] text-[#102a43]">
                      7{" "}
                      <span className="font-sans text-base font-bold tracking-normal text-[#5c7185]">
                        dias
                      </span>
                    </p>
                    <div className="mt-5 flex gap-1.5">
                      {["S", "T", "Q", "Q", "S", "S", "D"].map((day, index) => (
                        <div
                          key={`${day}-${index}`}
                          className={`grid size-7 place-items-center rounded-full text-[10px] font-bold ${index < 5 ? "bg-[#087f8c] text-white" : "bg-[#e8eff1] text-[#5c7185]"}`}
                        >
                          {day}
                        </div>
                      ))}
                    </div>
                    <p className="mt-5 text-xs leading-5 text-[#5c7185]">
                      Mais 7 dias para desbloquear a conquista{" "}
                      <strong className="text-[#102a43]">Constância</strong>.
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-[26px] border border-white/15 bg-white/10 p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[.16em] text-[#8ca4b3]">
                      Mapa de competências
                    </p>
                    <p className="mt-1 text-sm text-[#aac0cd]">
                      Atualizado agora
                    </p>
                  </div>
                  <div className="grid size-10 place-items-center rounded-full bg-[#087f8c] text-white">
                    <TrendingUp className="size-4" />
                  </div>
                </div>
                <div className="space-y-5">
                  {skills.map((skill, index) => (
                    <button
                      key={skill.name}
                      onClick={() => setActiveSkill(index)}
                      className={`w-full text-left transition ${activeSkill === index ? "opacity-100" : "opacity-65 hover:opacity-90"}`}
                    >
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-semibold text-white">
                          {skill.name}
                        </span>
                        <span className="font-bold text-[#f4b942]">
                          {skill.value}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/15">
                        <div
                          className={`h-full rounded-full ${skill.color === "amber" ? "bg-[#f4b942]" : skill.color === "blue" ? "bg-[#82acd1]" : "bg-[#55c4b8]"}`}
                          style={{ width: `${skill.value}%` }}
                        />
                      </div>
                    </button>
                  ))}
                </div>
                <div className="mt-8 border-t border-white/15 pt-5">
                  <p className="text-xs uppercase tracking-[.15em] text-[#8ca4b3]">
                    Foco selecionado
                  </p>
                  <p className="mt-2 font-bold text-white">{active.name}</p>
                  <p className="mt-1 text-sm text-[#aac0cd]">
                    A próxima revisão aparece quando você precisar dela.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="recursos" className="bg-white px-5 py-24 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="grid items-center gap-14 lg:grid-cols-[.85fr_1.15fr]">
              <div>
                <SectionEyebrow>Uma mentora no seu ritmo</SectionEyebrow>
                <h2 className="font-display text-5xl font-medium leading-[.98] tracking-[-.07em] text-[#102a43] sm:text-6xl">
                  Quando travar, você não precisa travar{" "}
                  <span className="text-[#087f8c]">sozinho.</span>
                </h2>
                <p className="mt-6 max-w-md leading-7 text-[#5c7185]">
                  A IA Mentora faz perguntas, oferece pistas e encontra outro
                  jeito de explicar — sem estudar por você.
                </p>
                <button
                  className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#087f8c] px-5 py-3.5 font-bold text-white shadow-[0_5px_0_#05616b] transition hover:-translate-y-0.5"
                  onClick={() => setIsMentorOpen(true)}
                >
                  Conversar com a mentora <MessageCircle className="size-4" />
                </button>
              </div>
              <div className="relative rounded-[28px] bg-[#f1f7f7] p-5 sm:p-8">
                <div className="absolute -right-4 -top-4 grid size-14 place-items-center rounded-2xl bg-[#f4b942] text-[#102a43] shadow-lg">
                  <BrainCircuit className="size-6" />
                </div>
                <div className="mb-6 flex items-center gap-3">
                  <div className="grid size-11 place-items-center rounded-2xl bg-[#102a43] text-sm font-black text-white">
                    IA
                  </div>
                  <div>
                    <p className="font-bold text-[#102a43]">IA Mentora</p>
                    <p className="text-xs text-[#5c7185]">
                      Contexto: Matemática · Equações do 2º grau
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="max-w-[88%] rounded-2xl rounded-tl-sm border border-[#d7e3eb] bg-white p-4 text-sm leading-6 text-[#19324a]">
                    Oi, Vi que você está revisando o discriminante. Quer uma
                    dica ou um exemplo?
                  </div>
                  <div className="ml-auto max-w-[72%] rounded-2xl rounded-tr-sm bg-[#102a43] p-4 text-sm leading-6 text-white">
                    Uma dica, mas sem resolver por mim.
                  </div>
                  <div className="max-w-[88%] rounded-2xl rounded-tl-sm border border-[#d7e3eb] bg-white p-4 text-sm leading-6 text-[#19324a]">
                    Combinado. Antes de calcular, qual é o valor de{" "}
                    <strong>a</strong>, <strong>b</strong> e <strong>c</strong>{" "}
                    na equação?
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {prompts.slice(0, 2).map(prompt => (
                    <button
                      key={prompt}
                      onClick={() => {
                        setIsMentorOpen(true);
                        sendMentorMessage(prompt);
                      }}
                      className="rounded-full border border-[#c9dbde] bg-white px-3 py-2 text-xs font-semibold text-[#087f8c] transition hover:border-[#087f8c]"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#f4b942] px-5 py-20 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[.18em] text-[#8a5714]">
                Seu ritmo. Seu caminho.
              </p>
              <h2 className="mt-3 max-w-xl font-display text-5xl font-medium leading-[.95] tracking-[-.07em] text-[#102a43] sm:text-6xl">
                Pronto para começar sua próxima fase?
              </h2>
            </div>
            <a
              href="#painel"
              className="group inline-flex shrink-0 items-center gap-3 rounded-xl bg-[#102a43] px-6 py-4 font-bold text-white shadow-[0_5px_0_#087f8c] transition hover:-translate-y-0.5"
            >
              Começar minha trilha{" "}
              <ArrowRight className="size-4 transition group-hover:translate-x-1" />
            </a>
          </div>
        </section>
      </main>

      <footer className="bg-[#102a43] px-5 py-10 text-[#aac0cd] lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <Logo />
          <div className="text-sm">Aprender também é saber para onde ir.</div>
          <div className="text-xs text-[#6e8b9e]">© 2026 Trilha · ODS 9</div>
        </div>
      </footer>

      {isMentorOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-end bg-[#071b2e]/50 p-0 backdrop-blur-sm sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-label="IA Mentora"
        >
          <div className="mentor-drawer flex h-[min(720px,100vh)] w-full flex-col rounded-t-[28px] bg-[#f7fafc] p-5 shadow-2xl sm:h-full sm:max-w-[450px] sm:rounded-[28px] sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-2xl bg-[#102a43] text-sm font-black text-white">
                  IA
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#102a43]">
                    IA Mentora
                  </h2>
                  <p className="text-xs text-[#5c7185]">
                    Guiando sem fazer por você
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMentorOpen(false)}
                className="grid size-9 place-items-center rounded-xl border border-[#d7e3eb] text-[#5c7185] hover:text-[#102a43]"
                aria-label="Fechar mentora"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="my-5 flex-1 space-y-3 overflow-y-auto pr-1">
              {mentorMessages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex gap-2 ${message.role === "student" ? "justify-end" : ""}`}
                >
                  <div
                    className={`max-w-[86%] rounded-2xl p-3.5 text-sm leading-6 ${message.role === "student" ? "rounded-tr-sm bg-[#102a43] text-white" : "rounded-tl-sm border border-[#d7e3eb] bg-white text-[#19324a]"}`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="mb-3 flex flex-wrap gap-2">
              {prompts.map(prompt => (
                <button
                  key={prompt}
                  onClick={() => sendMentorMessage(prompt)}
                  className="rounded-full border border-[#c9dbde] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#087f8c]"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <div className="flex gap-2 rounded-2xl border border-[#d7e3eb] bg-white p-2">
              <input
                value={input}
                onChange={event => setInput(event.target.value)}
                onKeyDown={event => {
                  if (event.key === "Enter") sendMentorMessage();
                }}
                placeholder="Escreva uma dúvida..."
                className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none"
              />
              <button
                onClick={() => sendMentorMessage()}
                className="grid size-10 place-items-center rounded-xl bg-[#087f8c] text-white transition hover:bg-[#05616b]"
                aria-label="Enviar mensagem"
              >
                <ArrowRight className="size-4" />
              </button>
            </div>
            <p className="mt-3 text-center text-[11px] text-[#7d909d]">
              A mentora oferece apoio ao estudo, não diagnóstico ou tratamento.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function CompassIcon() {
  return <CircleHelp className="size-6" />;
}

type EntryMode = "login" | "signup";

type StudentProfile = {
  name: string;
  email: string;
  grade: string;
  goal: string;
};

function EntryScreen({
  mode,
  onBack,
  onSwitch,
  onComplete,
}: {
  mode: EntryMode;
  onBack: () => void;
  onSwitch: (next: EntryMode) => void;
  onComplete: (mode: EntryMode, profile: StudentProfile) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    if (!email || !email.includes("@")) {
      setError("Digite um e-mail válido para continuar.");
      return;
    }
    if (password.length < 6) {
      setError("Sua senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    const submittedName = String(form.get("name") || "").trim();
    onComplete(mode, {
      name: submittedName || email.split("@")[0],
      email,
      grade: "",
      goal: "",
    });
  }

  return (
    <div className="entry-shell min-h-screen bg-[#102a43] text-white">
      <div className="hero-grid absolute inset-0 opacity-30" />
      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-5 py-10 lg:grid-cols-[.9fr_1.1fr] lg:px-8">
        <div className="hidden lg:block">
          <a
            href="#"
            onClick={event => {
              event.preventDefault();
              onBack();
            }}
            className="mb-16 inline-flex items-center gap-3 text-white"
          >
            <span className="relative grid size-9 place-items-center rounded-[13px] bg-[#087f8c] shadow-[4px_4px_0_#f4b942]">
              <Sparkles className="size-4" />
            </span>
            <span className="font-display text-2xl font-semibold tracking-[-.06em]">
              trilha
            </span>
          </a>
          <SectionEyebrow dark>Aprendizagem que acompanha você</SectionEyebrow>
          <h1 className="max-w-xl font-display text-6xl font-medium leading-[.95] tracking-[-.07em] text-white">
            Um caminho claro para o seu próximo{" "}
            <em className="text-[#f4b942]">avanço.</em>
          </h1>
          <p className="mt-7 max-w-md text-lg leading-8 text-[#c6d5df]">
            A Trilha entende seu momento, organiza seus estudos e ajuda você a
            aprender com mais intenção.
          </p>
          <div className="mt-10 grid max-w-md gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
              <Target className="size-5 text-[#f4b942]" />
              <p className="mt-3 text-sm font-bold">Jornada personalizada</p>
              <p className="mt-1 text-xs leading-5 text-[#aac0cd]">
                Conteúdo que acompanha seu ritmo.
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
              <BrainCircuit className="size-5 text-[#8ddbd5]" />
              <p className="mt-3 text-sm font-bold">IA Mentora</p>
              <p className="mt-1 text-xs leading-5 text-[#aac0cd]">
                Dicas para pensar, não respostas prontas.
              </p>
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <button
              onClick={onBack}
              className="flex items-center gap-3 text-white"
            >
              <span className="grid size-9 place-items-center rounded-[13px] bg-[#087f8c] shadow-[4px_4px_0_#f4b942]">
                <Sparkles className="size-4" />
              </span>
              <span className="font-display text-2xl font-semibold">
                trilha
              </span>
            </button>
            <button
              onClick={onBack}
              className="text-sm font-bold text-[#aac0cd]"
            >
              Voltar
            </button>
          </div>
          <div className="rounded-[28px] bg-[#f7fafc] p-6 text-[#19324a] shadow-2xl sm:p-9">
            <div className="mb-8 flex gap-1 rounded-xl bg-[#eaf1f2] p-1">
              <button
                onClick={onBack}
                className="flex-1 rounded-lg px-3 py-2.5 text-sm font-bold text-[#5c7185] transition hover:text-[#087f8c]"
              >
                Apresentação
              </button>
              <button className="flex-1 rounded-lg bg-white px-3 py-2.5 text-sm font-bold text-[#102a43] shadow-sm">
                {mode === "login" ? "Login" : "Cadastro"}
              </button>
            </div>
            <div className="mb-7">
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[#087f8c]">
                {mode === "login"
                  ? "Que bom ter você de volta"
                  : "Comece sua jornada"}
              </p>
              <h2 className="mt-2 font-display text-4xl font-medium leading-tight tracking-[-.06em] text-[#102a43]">
                {mode === "login"
                  ? "Continue de onde parou."
                  : "Crie seu espaço de aprendizagem."}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#5c7185]">
                {mode === "login"
                  ? "Acesse seu painel, suas aulas e o seu próximo passo."
                  : "Leva menos de um minuto. Depois, vamos conhecer seus objetivos."}
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold text-[#19324a]">
                    Como podemos chamar você?
                  </span>
                  <input
                    name="name"
                    required
                    placeholder="Seu nome"
                    className="entry-input"
                  />
                </label>
              )}
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-[#19324a]">
                  E-mail
                </span>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="voce@email.com"
                  className="entry-input"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-[#19324a]">
                  Senha
                </span>
                <span className="relative block">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Mínimo de 6 caracteres"
                    className="entry-input pr-20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(current => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#087f8c]"
                  >
                    {showPassword ? "Ocultar" : "Mostrar"}
                  </button>
                </span>
              </label>
              {mode === "signup" && (
                <label className="flex items-start gap-2 text-xs leading-5 text-[#5c7185]">
                  <input
                    type="checkbox"
                    required
                    className="mt-1 accent-[#087f8c]"
                  />{" "}
                  <span>
                    Li e concordo com os termos de uso e a política de
                    privacidade.
                  </span>
                </label>
              )}
              {error && (
                <p className="rounded-xl bg-[#fbe8e4] px-3 py-2 text-xs font-semibold text-[#b55242]">
                  {error}
                </p>
              )}
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#087f8c] px-5 py-3.5 font-bold text-white shadow-[0_5px_0_#05616b] transition hover:-translate-y-0.5"
              >
                {mode === "login"
                  ? "Entrar na minha trilha"
                  : "Criar minha conta"}{" "}
                <ArrowRight className="size-4" />
              </button>
            </form>
            <div className="mt-6 flex items-center gap-3 text-xs text-[#7d909d]">
              <span className="h-px flex-1 bg-[#d7e3eb]" /> ou{" "}
              <span className="h-px flex-1 bg-[#d7e3eb]" />
            </div>
            <button
              onClick={() =>
                onComplete(mode, { name: "", email: "", grade: "", goal: "" })
              }
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#d7e3eb] bg-white px-5 py-3 text-sm font-bold text-[#102a43] transition hover:border-[#087f8c] hover:text-[#087f8c]"
            >
              <GraduationCap className="size-4" /> Explorar uma demonstração
            </button>
            <p className="mt-6 text-center text-xs text-[#7d909d]">
              {mode === "login"
                ? "Ainda não tem uma conta?"
                : "Já tem uma conta?"}{" "}
              <button
                onClick={() => {
                  setError("");
                  onSwitch(mode === "login" ? "signup" : "login");
                }}
                className="font-bold text-[#087f8c]"
              >
                {mode === "login" ? "Cadastre-se" : "Faça login"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function WelcomeScreen({
  onLogin,
  onSignup,
}: {
  onLogin: () => void;
  onSignup: () => void;
}) {
  return (
    <div className="entry-shell min-h-screen bg-[#102a43] text-white">
      <div className="hero-grid absolute inset-0 opacity-30" />
      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-5 py-10 lg:grid-cols-[1.05fr_.95fr] lg:px-8">
        <div className="max-w-2xl">
          <a
            href="#"
            className="mb-16 inline-flex items-center gap-3 text-white"
          >
            <span className="relative grid size-9 place-items-center rounded-[13px] bg-[#087f8c] shadow-[4px_4px_0_#f4b942]">
              <Sparkles className="size-4" />
            </span>
            <span className="font-display text-2xl font-semibold tracking-[-.06em]">
              trilha
            </span>
          </a>
          <SectionEyebrow dark>Aprendizagem que acompanha você</SectionEyebrow>
          <h1 className="max-w-xl font-display text-[clamp(3.5rem,7vw,6.7rem)] font-medium leading-[.91] tracking-[-.075em] text-white">
            Aprenda no seu ritmo.{" "}
            <em className="text-[#f4b942]">Evolua de verdade.</em>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-[#c6d5df]">
            A Trilha organiza seus estudos, entende suas dificuldades e mostra
            qual é o melhor próximo passo para você.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <button
              onClick={onSignup}
              className="inline-flex items-center gap-3 rounded-xl bg-[#f4b942] px-5 py-3.5 font-bold text-[#102a43] shadow-[0_5px_0_#b87517] transition hover:-translate-y-0.5"
            >
              Criar minha conta <ArrowRight className="size-4" />
            </button>
            <button
              onClick={onLogin}
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-5 py-3.5 font-bold text-white transition hover:bg-white/10"
            >
              Já tenho login
            </button>
          </div>
          <div className="mt-12 flex items-center gap-3 text-sm text-[#aac0cd]">
            <CheckCircle2 className="size-5 text-[#8ddbd5]" />
            <span>Diagnóstico, aulas, quizzes e mentora em um só lugar.</span>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-md">
          <div className="absolute -right-4 -top-8 size-24 rounded-full border-[14px] border-[#087f8c]/40" />
          <div className="rounded-[28px] border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-sm sm:p-7">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.16em] text-[#8ddbd5]">
                  Sua jornada começa aqui
                </p>
                <p className="mt-1 text-sm text-[#aac0cd]">
                  Tudo em um só lugar
                </p>
              </div>
              <div className="grid size-11 place-items-center rounded-2xl bg-[#f4b942] text-[#102a43]">
                <GraduationCap className="size-5" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-4 rounded-2xl bg-[#f7fafc] p-4 text-[#19324a]">
                <span className="grid size-10 place-items-center rounded-xl bg-[#dff5f3] text-[#087f8c]">
                  <Target className="size-5" />
                </span>
                <span>
                  <strong className="block text-sm">
                    Descubra seu ponto de partida
                  </strong>
                  <small className="text-xs text-[#5c7185]">
                    Um diagnóstico que faz sentido.
                  </small>
                </span>
              </div>
              <div className="flex items-center gap-4 rounded-2xl bg-[#f7fafc] p-4 text-[#19324a]">
                <span className="grid size-10 place-items-center rounded-xl bg-[#fff3d6] text-[#bd7418]">
                  <BookOpen className="size-5" />
                </span>
                <span>
                  <strong className="block text-sm">Estude com clareza</strong>
                  <small className="text-xs text-[#5c7185]">
                    Aulas curtas e prática guiada.
                  </small>
                </span>
              </div>
              <div className="flex items-center gap-4 rounded-2xl bg-[#f7fafc] p-4 text-[#19324a]">
                <span className="grid size-10 place-items-center rounded-xl bg-[#dbeafe] text-[#102a43]">
                  <MessageCircle className="size-5" />
                </span>
                <span>
                  <strong className="block text-sm">
                    Tenha apoio quando travar
                  </strong>
                  <small className="text-xs text-[#5c7185]">
                    Uma mentora para pensar com você.
                  </small>
                </span>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-white/15 pt-5 text-xs text-[#aac0cd]">
              <span>Aprenda sem comparação</span>
              <span className="flex items-center gap-1 text-[#f4b942]">
                <Flame className="size-3" /> Ritmo no seu tempo
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type DiagnosticAnswer = { subject: string; correct: boolean; topic: string };
type DiagnosticResult = {
  score: number;
  total: number;
  subjectScores: Record<string, number>;
  weakTopics: string[];
  answers: DiagnosticAnswer[];
};
type LocalPlan = {
  plan: { title: string; summary: string; weeklyMinutes: number };
  planItems: Array<{
    dayOrder: number;
    subject: string;
    title: string;
    activityKind: string;
    durationMinutes: number;
    rationale: string;
    completed: number;
  }>;
};
type OnboardingProps = {
  initialProfile: StudentProfile;
  onComplete: (profile: StudentProfile, result: DiagnosticResult) => void;
};
type DiagnosticQuestion = {
  id: string;
  subject: string;
  topic: string;
  level: "base" | "reforco" | "avancada";
  prompt: string;
  options: string[];
  correct: number;
};

const diagnosticBank: DiagnosticQuestion[] = [
  {
    id: "m-base",
    subject: "Matemática",
    topic: "Equação do 2º grau",
    level: "base",
    prompt: "Qual expressão representa uma equação do 2º grau?",
    options: ["ax + b = 0", "ax² + bx + c = 0", "a/x = b", "x + y = 2"],
    correct: 1,
  },
  {
    id: "m-reforco",
    subject: "Matemática",
    topic: "Equação do 2º grau",
    level: "reforco",
    prompt: "Na equação x² = 25, qual é uma das raízes?",
    options: ["3", "5", "10", "25"],
    correct: 1,
  },
  {
    id: "m-avancada",
    subject: "Matemática",
    topic: "Equação do 2º grau",
    level: "avancada",
    prompt: "O discriminante de x² - 5x + 6 = 0 é:",
    options: ["1", "5", "25", "49"],
    correct: 0,
  },
  {
    id: "l-base",
    subject: "Linguagens",
    topic: "Interpretação de texto",
    level: "base",
    prompt: "Ao interpretar um texto, o primeiro passo é:",
    options: [
      "Ler apenas o título",
      "Identificar tema e intenção",
      "Pular para a conclusão",
      "Ignorar o contexto",
    ],
    correct: 1,
  },
  {
    id: "l-reforco",
    subject: "Linguagens",
    topic: "Interpretação de texto",
    level: "reforco",
    prompt: "Inferir em uma leitura significa:",
    options: [
      "Copiar uma frase",
      "Construir sentido a partir de pistas",
      "Ignorar o contexto",
      "Ler somente imagens",
    ],
    correct: 1,
  },
  {
    id: "l-avancada",
    subject: "Linguagens",
    topic: "Interpretação de texto",
    level: "avancada",
    prompt: "Em um texto argumentativo, a tese é:",
    options: [
      "O título",
      "A ideia central defendida",
      "Um exemplo",
      "A referência",
    ],
    correct: 1,
  },
  {
    id: "c-base",
    subject: "Ciências",
    topic: "Ecossistemas",
    level: "base",
    prompt: "Em um ecossistema, seres vivos e ambiente:",
    options: [
      "Não se influenciam",
      "Formam relações interdependentes",
      "São sempre iguais",
      "Não trocam matéria",
    ],
    correct: 1,
  },
  {
    id: "c-reforco",
    subject: "Ciências",
    topic: "Ecossistemas",
    level: "reforco",
    prompt: "Na cadeia alimentar, produtores são organismos que:",
    options: [
      "Produzem seu próprio alimento",
      "Comem todos os animais",
      "Decompõem matéria",
      "Vivem apenas na água",
    ],
    correct: 0,
  },
  {
    id: "c-avancada",
    subject: "Ciências",
    topic: "Ecossistemas",
    level: "avancada",
    prompt:
      "A energia disponível tende a diminuir ao longo da cadeia alimentar porque:",
    options: [
      "Todos produzem energia",
      "Parte é usada e dissipada como calor",
      "A matéria desaparece",
      "Consumidores não respiram",
    ],
    correct: 1,
  },
];

const diagnosticSubjects = ["Matemática", "Linguagens", "Ciências"];

function planPreview(result: DiagnosticResult, grade: string) {
  const weakest =
    Object.entries(result.subjectScores).sort(
      ([, a], [, b]) => a - b
    )[0]?.[0] || "Matemática";
  const topic = result.weakTopics[0] || `Fundamentos de ${weakest}`;
  return [
    { day: "Dia 1", title: `Aula guiada: ${topic}`, kind: "Aula", minutes: 25 },
    {
      day: "Dia 2",
      title: `Quiz de prática: ${topic}`,
      kind: "Quiz",
      minutes: 15,
    },
    {
      day: "Dia 3",
      title: `Revisão essencial de ${weakest}`,
      kind: "Aula",
      minutes: 20,
    },
    {
      day: "Dia 4",
      title: `Quiz de recuperação: ${topic}`,
      kind: "Quiz",
      minutes: 15,
    },
    {
      day: "Dia 5",
      title: `Simulado para ${grade || "seu momento"}`,
      kind: "Simulado",
      minutes: 30,
    },
  ];
}

function OnboardingScreen({ initialProfile, onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [grade, setGrade] = useState(initialProfile.grade);
  const [goal, setGoal] = useState(initialProfile.goal);
  const [queue, setQueue] = useState<DiagnosticQuestion[]>(
    diagnosticBank.filter(item => item.level === "base")
  );
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<DiagnosticAnswer[]>([]);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const current = queue[questionIndex];

  function startDiagnostic() {
    setQueue([
      diagnosticBank.find(
        item => item.subject === diagnosticSubjects[0] && item.level === "base"
      )!,
    ]);
    setQuestionIndex(0);
    setAnswers([]);
    setSelected(null);
    setStep(2);
  }

  function finishDiagnostic(nextAnswers: DiagnosticAnswer[]) {
    const bySubject = Object.fromEntries(
      ["Matemática", "Linguagens", "Ciências"].map(subject => {
        const subjectAnswers = nextAnswers.filter(
          answer => answer.subject === subject
        );
        return [
          subject,
          subjectAnswers.length
            ? Math.round(
                (subjectAnswers.filter(answer => answer.correct).length /
                  subjectAnswers.length) *
                  100
              )
            : 0,
        ];
      })
    );
    const nextResult = {
      score: nextAnswers.filter(answer => answer.correct).length,
      total: nextAnswers.length,
      subjectScores: bySubject,
      weakTopics: Array.from(
        new Set(
          nextAnswers
            .filter(answer => !answer.correct)
            .map(answer => answer.topic)
        )
      ),
      answers: nextAnswers,
    };
    setResult(nextResult);
    setStep(3);
  }

  function nextQuestion() {
    if (selected === null || !current) return;
    const nextAnswers = [
      ...answers,
      {
        subject: current.subject,
        correct: selected === current.correct,
        topic: current.topic,
      },
    ];
    setAnswers(nextAnswers);
    const followLevel = selected === current.correct ? "avancada" : "reforco";
    const nextSubject =
      diagnosticSubjects[diagnosticSubjects.indexOf(current.subject) + 1];
    const nextQuestion =
      current.level === "base"
        ? diagnosticBank.find(
            item =>
              item.subject === current.subject && item.level === followLevel
          )
        : diagnosticBank.find(
            item => item.subject === nextSubject && item.level === "base"
          );
    const nextQueue = nextQuestion ? [...queue, nextQuestion] : queue;
    if (nextQuestion) setQueue(nextQueue);
    const nextIndex = questionIndex + 1;
    if (nextIndex >= nextQueue.length || nextAnswers.length >= 6)
      finishDiagnostic(nextAnswers);
    else {
      setQuestionIndex(nextIndex);
      setSelected(null);
    }
  }

  return (
    <div className="entry-shell min-h-screen bg-[#f7fafc] text-[#19324a]">
      <div className="mx-auto min-h-screen max-w-4xl px-5 py-8 lg:px-8">
        <div className="flex items-center justify-between">
          <Logo />
          <span className="text-xs font-bold uppercase tracking-[.15em] text-[#5c7185]">
            Cadastro · diagnóstico
          </span>
        </div>
        <div className="mx-auto mt-14 max-w-2xl">
          <div className="mb-10 flex gap-2">
            {[1, 2, 3].map(item => (
              <div
                key={item}
                className={`h-2 flex-1 rounded-full ${item <= step ? "bg-[#087f8c]" : "bg-[#dbe7eb]"}`}
              />
            ))}
          </div>
          {step === 1 && (
            <div>
              <SectionEyebrow>Vamos conhecer você</SectionEyebrow>
              <h1 className="font-display text-5xl font-medium leading-[.98] tracking-[-.07em] text-[#102a43]">
                O diagnóstico acontece{" "}
                <em className="text-[#087f8c]">agora no cadastro.</em>
              </h1>
              <p className="mt-5 max-w-lg leading-7 text-[#5c7185]">
                Não é uma tarefa extra nem uma prova. São perguntas adaptativas
                para entender seu ponto de partida e montar um plano inicial
                possível.
              </p>
              <div className="mt-8 space-y-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-[#102a43]">
                    Qual é a sua série?
                  </span>
                  <select
                    value={grade}
                    onChange={event => setGrade(event.target.value)}
                    className="entry-input"
                  >
                    <option value="">Selecione uma opção</option>
                    <option>6º ano do Ensino Fundamental</option>
                    <option>9º ano do Ensino Fundamental</option>
                    <option>1º ano do Ensino Médio</option>
                    <option>3º ano do Ensino Médio</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-[#102a43]">
                    O que você quer alcançar agora?
                  </span>
                  <select
                    value={goal}
                    onChange={event => setGoal(event.target.value)}
                    className="entry-input"
                  >
                    <option value="">Escolha seu objetivo</option>
                    <option>Preparar uma prova</option>
                    <option>Recuperar uma matéria</option>
                    <option>Criar uma rotina de estudos</option>
                    <option>Aprender melhor</option>
                  </select>
                </label>
              </div>
              <button
                disabled={!grade || !goal}
                onClick={startDiagnostic}
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#087f8c] px-5 py-3.5 font-bold text-white shadow-[0_5px_0_#05616b] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Começar diagnóstico <ArrowRight className="size-4" />
              </button>
            </div>
          )}
          {step === 2 && current && (
            <div>
              <SectionEyebrow>
                Diagnóstico adaptativo · {answers.length + 1} de até 6
              </SectionEyebrow>
              <h1 className="font-display text-5xl font-medium leading-[.98] tracking-[-.07em] text-[#102a43]">
                Vamos encontrar seu ponto de partida,{" "}
                <em className="text-[#087f8c]">sem pressa.</em>
              </h1>
              <p className="mt-5 leading-7 text-[#5c7185]">
                Se você acerta, a próxima pergunta aprofunda. Se erra, a próxima
                reforça o fundamento. Assim o diagnóstico se adapta a você.
              </p>
              <div className="mt-8 rounded-[24px] border border-[#d7e3eb] bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-[#dff5f3] px-3 py-1 text-xs font-bold text-[#087f8c]">
                    {current.subject} · {current.topic}
                  </span>
                  <span className="text-xs font-bold text-[#5c7185]">
                    {current.level === "base"
                      ? "fundamento"
                      : current.level === "reforco"
                        ? "reforço"
                        : "aprofundamento"}
                  </span>
                </div>
                <h2 className="mt-6 text-xl font-bold text-[#102a43]">
                  {current.prompt}
                </h2>
                <div className="mt-5 grid gap-3">
                  {current.options.map((option, index) => (
                    <button
                      key={option}
                      onClick={() => setSelected(index)}
                      className={`rounded-xl border p-4 text-left text-sm font-semibold transition ${selected === index ? "border-[#087f8c] bg-[#dff5f3] text-[#05616b]" : "border-[#d7e3eb] hover:border-[#087f8c]"}`}
                    >
                      {option}
                      {selected === index && (
                        <Check className="float-right size-4" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <button
                disabled={selected === null}
                onClick={nextQuestion}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#102a43] px-5 py-3.5 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {answers.length >= 5 ? "Gerar meu plano" : "Próxima pergunta"}{" "}
                <ArrowRight className="size-4" />
              </button>
            </div>
          )}
          {step === 3 && result && (
            <div>
              <SectionEyebrow>Diagnóstico concluído</SectionEyebrow>
              <h1 className="font-display text-5xl font-medium leading-[.98] tracking-[-.07em] text-[#102a43]">
                Seu plano começa pelo que você precisa{" "}
                <em className="text-[#087f8c]">agora.</em>
              </h1>
              <p className="mt-5 leading-7 text-[#5c7185]">
                Você acertou {result.score} de {result.total}. A Trilha usou
                suas respostas, série e objetivo para montar uma primeira semana
                de estudos.
              </p>
              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {Object.entries(result.subjectScores).map(
                  ([subject, value]) => (
                    <div
                      key={subject}
                      className="rounded-2xl bg-white p-4 shadow-sm"
                    >
                      <p className="text-xs font-black uppercase tracking-widest text-[#7d909d]">
                        {subject}
                      </p>
                      <p className="mt-2 text-2xl font-black text-[#087f8c]">
                        {value}%
                      </p>
                      <div className="mt-3 h-2 rounded-full bg-[#e8eff1]">
                        <div
                          className="h-full rounded-full bg-[#087f8c]"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
              <div className="mt-6 rounded-[24px] bg-[#102a43] p-6 text-white">
                <p className="text-xs font-black uppercase tracking-widest text-[#8ddbd5]">
                  Plano personalizado · 105 min
                </p>
                <h2 className="mt-2 text-2xl font-bold">Sua primeira semana</h2>
                <div className="mt-5 space-y-3">
                  {planPreview(result, grade).map(item => (
                    <div
                      key={item.day}
                      className="flex items-center gap-3 rounded-xl bg-white/10 p-3"
                    >
                      <span className="w-12 text-xs font-black text-[#f4b942]">
                        {item.day}
                      </span>
                      <span className="flex-1 text-sm font-semibold">
                        {item.title}
                      </span>
                      <span className="text-xs text-[#aac0cd]">
                        {item.minutes} min · {item.kind}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() =>
                  onComplete({ ...initialProfile, grade, goal }, result)
                }
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#087f8c] px-5 py-3.5 font-bold text-white shadow-[0_5px_0_#05616b]"
              >
                Entrar com meu plano <ArrowRight className="size-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardScreen({
  hasDiagnostic,
  profile,
}: {
  hasDiagnostic: boolean;
  profile: StudentProfile;
}) {
  const [query, setQuery] = useState("");
  const [started, setStarted] = useState(false);
  const results = query.trim()
    ? [
        "Aula · Equações do 2º grau",
        "Quiz · Discriminante",
        "Revisão · Interpretação de texto",
      ].filter(item => item.toLowerCase().includes(query.toLowerCase()))
    : [];
  return (
    <div className="min-h-screen bg-[#f7fafc] text-[#19324a]">
      <header className="sticky top-0 z-20 border-b border-[#dbe7eb]/80 bg-[#f7fafc]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-4 px-5 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-6 md:flex">
            <a className="nav-link" href="#dashboard">
              Painel
            </a>
            <a className="nav-link" href="#atividade">
              Minha atividade
            </a>
            <a className="nav-link" href="#perfil">
              Perfil
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#7d909d]" />
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Buscar aula, tópico ou quiz"
                className="w-64 rounded-xl border border-[#d7e3eb] bg-white py-2.5 pl-9 pr-3 text-xs outline-none focus:border-[#087f8c]"
              />
              {results.length > 0 && (
                <div className="absolute left-0 right-0 top-12 rounded-xl border border-[#d7e3eb] bg-white p-2 shadow-xl">
                  {results.map(result => (
                    <button
                      key={result}
                      onClick={() => setQuery("")}
                      className="block w-full rounded-lg p-2 text-left text-xs font-semibold hover:bg-[#dff5f3]"
                    >
                      {result}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="grid size-10 place-items-center rounded-full bg-[#102a43] text-xs font-bold text-white">
              {profile.name
                ? profile.name
                    .split(" ")
                    .map(part => part[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()
                : "?"}
            </div>
          </div>
        </div>
      </header>
      <main id="dashboard" className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <SectionEyebrow>Seu espaço de aprendizagem</SectionEyebrow>
            <h1 className="font-display text-5xl font-medium leading-[.98] tracking-[-.07em] text-[#102a43]">
              {profile.name ? `Olá, ${profile.name}.` : "Olá."}{" "}
              <em className="text-[#087f8c]">Vamos avançar?</em>
            </h1>
            <p className="mt-4 text-[#5c7185]">
              {hasDiagnostic
                ? "Seu diagnóstico foi registrado. Agora transforme a primeira recomendação em prática."
                : "Ainda estamos conhecendo seu momento. Faça o diagnóstico para liberar recomendações personalizadas."}
            </p>
            <p className="mt-2 text-sm font-semibold text-[#087f8c]">
              {profile.grade || "Série ainda não informada"} ·{" "}
              {profile.goal || "Objetivo ainda não informado"}
            </p>
          </div>
          <div className="rounded-2xl border border-[#d7e3eb] bg-white px-4 py-3 text-right">
            <p className="text-xs font-bold uppercase tracking-widest text-[#7d909d]">
              Dados pessoais
            </p>
            <p className="mt-1 text-sm font-bold text-[#102a43]">
              Métricas calculadas após atividades
            </p>
          </div>
        </div>
        {!hasDiagnostic && (
          <div className="mt-8 rounded-[24px] border border-dashed border-[#087f8c] bg-[#dff5f3] p-6">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-[#087f8c]">
                  Estado inicial
                </span>
                <h2 className="mt-2 text-2xl font-bold text-[#102a43]">
                  Seu mapa ainda está em branco — e tudo bem.
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5c7185]">
                  As porcentagens, sequência, XP e pontos fortes só aparecem
                  depois de ações registradas. Comece pelo onboarding e
                  diagnóstico para criar dados reais.
                </p>
              </div>
              <button className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#087f8c] px-4 py-3 text-sm font-bold text-white">
                Começar diagnóstico <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        )}
        {hasDiagnostic && (
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-[#102a43] p-5 text-white">
              <p className="text-xs uppercase tracking-widest text-[#aac0cd]">
                Próxima atividade
              </p>
              <h3 className="mt-4 text-xl font-bold">Equações do 2º grau</h3>
              <p className="mt-2 text-sm text-[#aac0cd]">
                Aula recomendada após o diagnóstico.
              </p>
              <button
                onClick={() => setStarted(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#f4b942] px-4 py-2.5 text-sm font-bold text-[#102a43]"
              >
                {started ? "Atividade iniciada" : "Começar aula"}{" "}
                <ArrowRight className="size-4" />
              </button>
            </div>
            <div className="rounded-2xl border border-[#d7e3eb] bg-white p-5">
              <p className="text-xs uppercase tracking-widest text-[#7d909d]">
                Histórico
              </p>
              <p className="mt-5 text-lg font-bold text-[#102a43]">
                1 diagnóstico
              </p>
              <p className="mt-2 text-sm text-[#5c7185]">
                Tentativas registradas na sua jornada.
              </p>
            </div>
            <div className="rounded-2xl border border-[#d7e3eb] bg-white p-5">
              <p className="text-xs uppercase tracking-widest text-[#7d909d]">
                Mapa de competências
              </p>
              <p className="mt-5 text-lg font-bold text-[#102a43]">
                Em construção
              </p>
              <p className="mt-2 text-sm text-[#5c7185]">
                Mais evidências aparecem após aula e quiz.
              </p>
            </div>
          </div>
        )}
        <div
          id="atividade"
          className="mt-12 grid gap-5 lg:grid-cols-[1.2fr_.8fr]"
        >
          <div className="rounded-[24px] border border-[#d7e3eb] bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <SectionEyebrow>Como a Trilha decide</SectionEyebrow>
                <h2 className="text-2xl font-bold text-[#102a43]">
                  Seu próximo melhor passo
                </h2>
              </div>
              <BrainCircuit className="size-6 text-[#087f8c]" />
            </div>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-[#f4f8fb] p-4">
                <Target className="size-5 text-[#087f8c]" />
                <p className="mt-3 text-sm font-bold">Contexto</p>
                <p className="mt-1 text-xs leading-5 text-[#5c7185]">
                  Série, objetivo e disponibilidade.
                </p>
              </div>
              <div className="rounded-xl bg-[#f4f8fb] p-4">
                <TrendingUp className="size-5 text-[#bd7418]" />
                <p className="mt-3 text-sm font-bold">Evidência</p>
                <p className="mt-1 text-xs leading-5 text-[#5c7185]">
                  Respostas, erros e tentativas.
                </p>
              </div>
              <div className="rounded-xl bg-[#f4f8fb] p-4">
                <RefreshIcon className="size-5 text-[#102a43]" />
                <p className="mt-3 text-sm font-bold">Revisão</p>
                <p className="mt-1 text-xs leading-5 text-[#5c7185]">
                  Intervalos adaptados ao seu ritmo.
                </p>
              </div>
            </div>
          </div>
          <div
            id="perfil"
            className="rounded-[24px] border border-[#d7e3eb] bg-white p-6"
          >
            <SectionEyebrow>Privacidade</SectionEyebrow>
            <h2 className="text-2xl font-bold text-[#102a43]">
              Você no controle
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#5c7185]">
              Usamos apenas informações necessárias para personalizar seu
              estudo. Você pode editar objetivos e preferências no perfil.
            </p>
            <button className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#087f8c]">
              Editar preferências <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function SearchIcon(props: { className?: string }) {
  return <CircleHelp {...props} />;
}
function RefreshIcon(props: { className?: string }) {
  return <Zap {...props} />;
}

type ActivityKind = "aula" | "quiz" | "simulado";

type ActivityItem = {
  kind: ActivityKind;
  title: string;
  subject: string;
  duration: string;
  description: string;
};

type RemoteStudentState = {
  progress: Array<{
    activityKind: string;
    percent: number;
    completedCount: number;
  }>;
  achievements: Array<{ slug: string; title: string; description: string }>;
  attempts: Array<{
    activityKind: string;
    subject: string;
    score: number;
    total: number;
    feedback: string | null;
    weakTopics: string | null;
    completedAt: Date | string;
  }>;
  plan?: { title: string; summary: string; weeklyMinutes: number };
  planItems: Array<{
    dayOrder: number;
    subject: string;
    title: string;
    activityKind: string;
    durationMinutes: number;
    rationale: string;
    completed: number;
  }>;
};

function DashboardExperience({
  hasDiagnostic,
  profile,
  onProfileChange,
  remoteState,
  localPlan,
  canPersist,
  onLogout,
}: {
  hasDiagnostic: boolean;
  profile: StudentProfile;
  onProfileChange: (profile: StudentProfile) => void;
  remoteState?: RemoteStudentState;
  localPlan?: LocalPlan;
  canPersist: boolean;
  onLogout: () => Promise<void>;
}) {
  const [activePanel, setActivePanel] = useState<"dashboard" | "profile">(
    "dashboard"
  );
  const [editingProfile, setEditingProfile] = useState(profile);
  const [activityKind, setActivityKind] = useState<ActivityKind>("aula");
  const [completed, setCompleted] = useState<Record<ActivityKind, number>>(
    () => {
      try {
        return JSON.parse(
          localStorage.getItem("trilha_progress") ||
            '{"aula":0,"quiz":0,"simulado":0}'
        );
      } catch {
        return { aula: 0, quiz: 0, simulado: 0 };
      }
    }
  );
  const [sessionAchievements, setSessionAchievements] = useState<
    Array<{ slug: string; title: string; description: string }>
  >([]);
  useEffect(() => {
    if (!remoteState?.progress?.length) return;
    setCompleted(current => ({
      ...current,
      ...Object.fromEntries(
        remoteState.progress
          .filter(item => item.activityKind !== "diagnostico")
          .map(item => [item.activityKind, item.percent])
      ),
    }));
  }, [remoteState]);
  const [search, setSearch] = useState("");
  const [showRunner, setShowRunner] = useState(false);
  const saveProfileMutation = trpc.student.saveProfile.useMutation();
  const recordActivityMutation = trpc.student.recordActivity.useMutation();
  const deleteAccountMutation = trpc.student.deleteAccount.useMutation();
  const activities: Record<ActivityKind, ActivityItem> = {
    aula: {
      kind: "aula",
      title: "Aula guiada de Matemática",
      subject: "Equações do 2º grau",
      duration: "20 min",
      description:
        "Entenda o discriminante com exemplos curtos e prática guiada.",
    },
    quiz: {
      kind: "quiz",
      title: "Quiz de revisão",
      subject: "Discriminante e raízes",
      duration: "8 questões",
      description:
        "Escolha o nível de dificuldade e receba feedback após cada resposta.",
    },
    simulado: {
      kind: "simulado",
      title: "Simulado personalizado",
      subject: profile.grade || "Sua série",
      duration: "15 questões",
      description:
        "Uma mistura de questões baseada no seu objetivo de estudo atual.",
    },
  };
  const currentActivity = activities[activityKind];
  const progress = {
    diagnostico: hasDiagnostic ? 100 : 0,
    aula: completed.aula,
    quiz: completed.quiz,
    simulado: completed.simulado,
  };
  const totalCompleted =
    Object.values(completed).filter(value => value > 0).length +
    (hasDiagnostic ? 1 : 0);
  useEffect(() => {
    localStorage.setItem("trilha_progress", JSON.stringify(completed));
  }, [completed]);

  function saveProfile() {
    onProfileChange(editingProfile);
    if (canPersist)
      saveProfileMutation.mutate({
        ...editingProfile,
        diagnosticCompleted: hasDiagnostic,
      });
    setActivePanel("dashboard");
  }

  function completeActivity() {
    setCompleted(current => ({ ...current, [activityKind]: 100 }));
    if (canPersist)
      recordActivityMutation.mutate({
        activityKind,
        subject: currentActivity.subject,
        feedback: "Atividade concluída com sucesso.",
      });
  }

  const initials = profile.name
    ? profile.name
        .split(" ")
        .map(part => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  if (!hasDiagnostic) return <LockedDiagnosticScreen onLogout={onLogout} />;

  return (
    <div className="dashboard-shell min-h-screen bg-[#f7fafc] text-[#19324a]">
      <header className="sticky top-0 z-30 border-b border-[#dbe7eb]/80 bg-[#f7fafc]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-4 px-5 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-6 md:flex">
            <button
              onClick={() => setActivePanel("dashboard")}
              className={`nav-link ${activePanel === "dashboard" ? "text-[#087f8c]" : ""}`}
            >
              Painel
            </button>
            <button
              onClick={() => setActivePanel("profile")}
              className={`nav-link ${activePanel === "profile" ? "text-[#087f8c]" : ""}`}
            >
              Meu perfil
            </button>
          </nav>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#7d909d]" />
              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Buscar aula, quiz ou simulado"
                className="w-64 rounded-xl border border-[#d7e3eb] bg-white py-2.5 pl-9 pr-3 text-xs outline-none focus:border-[#087f8c]"
              />
              {search && (
                <div className="absolute left-0 right-0 top-12 rounded-xl border border-[#d7e3eb] bg-white p-2 text-xs shadow-xl">
                  <button
                    className="block w-full rounded-lg p-2 text-left font-semibold hover:bg-[#dff5f3]"
                    onClick={() => {
                      setSearch("");
                      setActivityKind("quiz");
                      setActivePanel("dashboard");
                    }}
                  >
                    Quiz · {search}
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => setActivePanel("profile")}
              className="avatar"
              aria-label="Abrir perfil"
            >
              {initials}
            </button>
            <button
              onClick={onLogout}
              className="hidden text-xs font-bold text-[#b55242] sm:block"
            >
              Sair
            </button>
          </div>
        </div>
      </header>
      {activePanel === "profile" ? (
        <ProfilePanel
          profile={editingProfile}
          achievements={[
            ...(remoteState?.achievements || []),
            ...sessionAchievements,
          ]}
          onChange={setEditingProfile}
          onSave={saveProfile}
          onDelete={async () => {
            if (
              window.confirm(
                "Excluir sua conta e todos os dados de estudo? Esta ação não pode ser desfeita."
              )
            ) {
              await deleteAccountMutation.mutateAsync();
              await onLogout();
            }
          }}
          onCancel={() => setActivePanel("dashboard")}
        />
      ) : (
        <main id="dashboard" className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <SectionEyebrow>Seu espaço de aprendizagem</SectionEyebrow>
              <h1 className="font-display text-5xl font-medium leading-[.98] tracking-[-.07em] text-[#102a43]">
                Olá, {profile.name || "estudante"}.{" "}
                <em className="text-[#087f8c]">Vamos avançar?</em>
              </h1>
              <p className="mt-4 text-[#5c7185]">
                {hasDiagnostic
                  ? "Seu diagnóstico foi registrado. Escolha como você quer estudar agora."
                  : "Complete seu diagnóstico para liberar recomendações personalizadas."}
              </p>
              <p className="mt-2 text-sm font-semibold text-[#087f8c]">
                {profile.grade || "Série ainda não informada"} ·{" "}
                {profile.goal || "Objetivo ainda não informado"}
              </p>
            </div>
            <button
              onClick={() => setActivePanel("profile")}
              className="inline-flex items-center gap-2 self-start rounded-xl border border-[#d7e3eb] bg-white px-4 py-3 text-sm font-bold text-[#102a43] transition hover:border-[#087f8c]"
            >
              Editar informações <ChevronRight className="size-4" />
            </button>
          </div>
          {!hasDiagnostic && (
            <div className="mt-8 rounded-[24px] border border-dashed border-[#087f8c] bg-[#dff5f3] p-6">
              <span className="text-xs font-black uppercase tracking-widest text-[#087f8c]">
                Estado inicial
              </span>
              <h2 className="mt-2 text-2xl font-bold text-[#102a43]">
                Seu mapa ainda está em branco — e tudo bem.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5c7185]">
                As barras começam a avançar depois de ações reais. O diagnóstico
                é o primeiro passo para criar uma trilha que faça sentido para
                você.
              </p>
            </div>
          )}
          <section className="mt-8 rounded-[24px] border border-[#d7e3eb] bg-white p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <SectionEyebrow>Seu progresso</SectionEyebrow>
                <h2 className="text-2xl font-bold text-[#102a43]">
                  Acompanhe cada etapa
                </h2>
              </div>
              <span className="rounded-full bg-[#eaf4f3] px-3 py-1.5 text-xs font-bold text-[#087f8c]">
                {totalCompleted} de 4 etapas iniciadas
              </span>
            </div>
            <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {(
                [
                  ["Diagnóstico", progress.diagnostico, "teal"],
                  ["Aulas", progress.aula, "amber"],
                  ["Quizzes", progress.quiz, "blue"],
                  ["Simulados", progress.simulado, "navy"],
                ] as const
              ).map(([label, value, color]) => (
                <div key={label}>
                  <div className="mb-2 flex justify-between text-xs font-bold">
                    <span>{label}</span>
                    <span className="text-[#5c7185]">{value}%</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-[#e8eff1]">
                    <div
                      className={`progress-fill progress-${color}`}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-[#7d909d]">
                    {value === 100
                      ? "Concluído"
                      : value === 0
                        ? "Ainda não iniciado"
                        : "Em andamento"}
                  </p>
                </div>
              ))}
            </div>
          </section>
          <StudyPlanPanel
            plan={remoteState?.plan || localPlan?.plan}
            items={remoteState?.planItems || localPlan?.planItems || []}
          />
          <section className="mt-8 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
            <div className="rounded-[24px] bg-[#102a43] p-6 text-white">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <SectionEyebrow dark>Escolha seu ritmo</SectionEyebrow>
                  <h2 className="text-2xl font-bold text-white">
                    O que você quer fazer agora?
                  </h2>
                  <p className="mt-2 max-w-lg text-sm leading-6 text-[#aac0cd]">
                    A atividade muda de acordo com sua escolha. Você pode
                    alternar entre aprender, revisar ou testar seus
                    conhecimentos.
                  </p>
                </div>
                <Sparkles className="size-6 text-[#f4b942]" />
              </div>
              <div className="mt-7 grid gap-2 sm:grid-cols-3">
                {(
                  [
                    ["aula", "Aula", BookOpen],
                    ["quiz", "Quiz", CircleHelp],
                    ["simulado", "Simulado", Target],
                  ] as const
                ).map(([kind, label, Icon]) => (
                  <button
                    key={kind}
                    onClick={() => {
                      setActivityKind(kind);
                      setShowRunner(false);
                    }}
                    className={`activity-choice ${activityKind === kind ? "activity-choice-active" : ""}`}
                  >
                    <Icon className="size-5" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
              <div className="mt-5 rounded-2xl bg-white/10 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#8ddbd5]">
                      {currentActivity.subject}
                    </p>
                    <h3 className="mt-2 text-xl font-bold text-white">
                      {currentActivity.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[#aac0cd]">
                      {currentActivity.description}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#f4b942] px-3 py-1 text-xs font-black text-[#102a43]">
                    {currentActivity.duration}
                  </span>
                </div>
                <button
                  onClick={() =>
                    activityKind === "aula"
                      ? completeActivity()
                      : setShowRunner(true)
                  }
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#f4b942] px-4 py-3 text-sm font-bold text-[#102a43]"
                >
                  {completed[activityKind] === 100
                    ? "Concluído nesta sessão"
                    : `Começar ${activityKind}`}{" "}
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
            {showRunner &&
            (activityKind === "quiz" || activityKind === "simulado") ? (
              <QuizRunner
                kind={activityKind}
                profile={profile}
                onCancel={() => setShowRunner(false)}
                onComplete={(score, total, feedback, weakTopics) => {
                  setCompleted(current => ({
                    ...current,
                    [activityKind]: 100,
                  }));
                  setSessionAchievements(current => [
                    ...current,
                    {
                      slug: "primeiro-quiz-sessao",
                      title: "Primeira tentativa",
                      description: "Você concluiu uma atividade avaliativa.",
                    },
                    ...(score === total
                      ? [
                          {
                            slug: "dominio-total-sessao",
                            title: "Domínio total",
                            description:
                              "Você acertou todas as questões desta tentativa.",
                          },
                        ]
                      : []),
                  ]);
                  if (canPersist)
                    recordActivityMutation.mutate({
                      activityKind,
                      subject: currentActivity.subject,
                      score,
                      total,
                      feedback,
                      weakTopics,
                    });
                  setShowRunner(false);
                }}
              />
            ) : (
              <div className="rounded-[24px] border border-[#d7e3eb] bg-white p-6">
                <SectionEyebrow>Personalização</SectionEyebrow>
                <h2 className="text-2xl font-bold text-[#102a43]">
                  Baseado no seu cadastro
                </h2>
                <div className="mt-6 space-y-4">
                  <div className="rounded-xl bg-[#f4f8fb] p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#7d909d]">
                      Série
                    </p>
                    <p className="mt-1 font-bold text-[#102a43]">
                      {profile.grade || "Não informada"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#f4f8fb] p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#7d909d]">
                      Objetivo
                    </p>
                    <p className="mt-1 font-bold text-[#102a43]">
                      {profile.goal || "Não informado"}
                    </p>
                  </div>
                  <p className="text-xs leading-5 text-[#7d909d]">
                    Você pode editar essas preferências a qualquer momento. As
                    atividades serão reordenadas sem penalizar sessões perdidas.
                  </p>
                </div>
              </div>
            )}
          </section>
          <HistoryPanel attempts={remoteState?.attempts || []} />
        </main>
      )}
    </div>
  );
}

function ProfilePanel({
  profile,
  achievements,
  onChange,
  onSave,
  onDelete,
  onCancel,
}: {
  profile: StudentProfile;
  achievements: Array<{ slug: string; title: string; description: string }>;
  onChange: (profile: StudentProfile) => void;
  onSave: () => void;
  onDelete: () => Promise<void>;
  onCancel: () => void;
}) {
  return (
    <main className="profile-page mx-auto max-w-3xl px-5 py-12 lg:px-8">
      <button
        onClick={onCancel}
        className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-[#087f8c]"
      >
        <ArrowRight className="size-4 rotate-180" /> Voltar ao painel
      </button>
      <SectionEyebrow>Meu perfil</SectionEyebrow>
      <h1 className="font-display text-5xl font-medium leading-[.98] tracking-[-.07em] text-[#102a43]">
        Suas informações, <em className="text-[#087f8c]">do seu jeito.</em>
      </h1>
      <p className="mt-4 max-w-xl leading-7 text-[#5c7185]">
        Esses dados ajudam a Trilha a escolher conteúdos e atividades mais
        relevantes para sua jornada.
      </p>
      <div className="mt-9 rounded-[24px] border border-[#d7e3eb] bg-white p-6 shadow-sm sm:p-8">
        <div className="grid gap-5">
          <label>
            <span className="profile-label">Nome</span>
            <input
              value={profile.name}
              onChange={event =>
                onChange({ ...profile, name: event.target.value })
              }
              className="entry-input"
              placeholder="Seu nome"
            />
          </label>
          <label>
            <span className="profile-label">E-mail</span>
            <input
              value={profile.email}
              onChange={event =>
                onChange({ ...profile, email: event.target.value })
              }
              className="entry-input"
              type="email"
              placeholder="voce@email.com"
            />
          </label>
          <label>
            <span className="profile-label">Série</span>
            <select
              value={profile.grade}
              onChange={event =>
                onChange({ ...profile, grade: event.target.value })
              }
              className="entry-input"
            >
              <option value="">Selecione sua série</option>
              <option>6º ano do Ensino Fundamental</option>
              <option>9º ano do Ensino Fundamental</option>
              <option>1º ano do Ensino Médio</option>
              <option>3º ano do Ensino Médio</option>
            </select>
          </label>
          <label>
            <span className="profile-label">Objetivo de estudo</span>
            <select
              value={profile.goal}
              onChange={event =>
                onChange({ ...profile, goal: event.target.value })
              }
              className="entry-input"
            >
              <option value="">Escolha seu objetivo</option>
              <option>Preparar uma prova</option>
              <option>Recuperar uma matéria</option>
              <option>Criar uma rotina de estudos</option>
              <option>Aprender melhor</option>
            </select>
          </label>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            onClick={onSave}
            className="inline-flex items-center gap-2 rounded-xl bg-[#087f8c] px-5 py-3 font-bold text-white shadow-[0_5px_0_#05616b]"
          >
            Salvar informações <Check className="size-4" />
          </button>
          <button
            onClick={onCancel}
            className="rounded-xl border border-[#d7e3eb] px-5 py-3 font-bold text-[#5c7185]"
          >
            Cancelar
          </button>
        </div>
      </div>
      <section className="mt-6 rounded-[24px] border border-[#d7e3eb] bg-white p-6">
        <SectionEyebrow>Conquistas</SectionEyebrow>
        <h2 className="text-2xl font-bold text-[#102a43]">
          Medalhas da sua jornada
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#5c7185]">
          Cada medalha é desbloqueada somente depois de uma tentativa de quiz ou
          simulado registrada.
        </p>
        {achievements.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-[#d7e3eb] bg-[#f7fafc] p-5 text-sm text-[#7d909d]">
            Nenhuma medalha desbloqueada ainda. Conclua seu primeiro quiz para
            começar.
          </div>
        ) : (
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {achievements.map(achievement => (
              <div
                key={achievement.slug}
                className="achievement-card rounded-2xl bg-[#fff3d6] p-4"
              >
                <span className="medal-icon">★</span>
                <h3 className="mt-3 text-sm font-bold text-[#102a43]">
                  {achievement.title}
                </h3>
                <p className="mt-1 text-xs leading-5 text-[#7d5b20]">
                  {achievement.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
      <section className="mt-6 rounded-[24px] border border-[#f0c6bd] bg-[#fff7f5] p-6">
        <SectionEyebrow>Zona de conta</SectionEyebrow>
        <h2 className="text-xl font-bold text-[#102a43]">
          Excluir minha conta
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#7b5b55]">
          Remove seu perfil, diagnóstico, plano, histórico, progresso e
          conquistas do banco. A exclusão exige confirmação e não pode ser
          desfeita.
        </p>
        <button
          onClick={onDelete}
          className="mt-5 rounded-xl border border-[#b55242] px-4 py-3 text-sm font-bold text-[#b55242]"
        >
          Excluir conta permanentemente
        </button>
      </section>
      <div className="mt-5 rounded-2xl bg-[#eaf4f3] p-5 text-sm leading-6 text-[#5c7185]">
        <strong className="text-[#102a43]">Privacidade:</strong> usamos nome,
        série e objetivo somente para personalizar sua experiência. Métricas de
        progresso não podem ser editadas manualmente.
      </div>
    </main>
  );
}

type QuizQuestion = {
  prompt: string;
  options: string[];
  correct: number;
  explanation: string;
  subject: string;
};

const mathQuestions: QuizQuestion[] = [
  {
    subject: "Matemática",
    prompt: "Qual é o valor de x em 2x + 6 = 14?",
    options: ["2", "4", "6", "10"],
    correct: 1,
    explanation: "Subtraia 6 dos dois lados: 2x = 8. Dividindo por 2, x = 4.",
  },
  {
    subject: "Matemática",
    prompt: "Qual é a solução positiva de x² = 49?",
    options: ["7", "14", "-7", "49"],
    correct: 0,
    explanation:
      "As raízes são 7 e -7; quando a pergunta pede a solução positiva, a resposta é 7.",
  },
  {
    subject: "Matemática",
    prompt: "Em uma função y = 3x + 2, qual é o valor de y quando x = 2?",
    options: ["5", "6", "8", "9"],
    correct: 2,
    explanation: "Substituindo x por 2: y = 3(2) + 2 = 8.",
  },
  {
    subject: "Matemática",
    prompt: "O discriminante de x² - 5x + 6 = 0 é:",
    options: ["1", "5", "25", "49"],
    correct: 0,
    explanation: "Delta = b² - 4ac = (-5)² - 4(1)(6) = 25 - 24 = 1.",
  },
  {
    subject: "Matemática",
    prompt: "A fração 3/4 corresponde a qual porcentagem?",
    options: ["25%", "50%", "75%", "80%"],
    correct: 2,
    explanation:
      "Dividindo 3 por 4, obtemos 0,75; multiplicando por 100, temos 75%.",
  },
  {
    subject: "Matemática",
    prompt:
      "Um triângulo com lados 3, 4 e 5 é classificado, quanto aos ângulos, como:",
    options: ["Acutângulo", "Retângulo", "Obtusângulo", "Equilátero"],
    correct: 1,
    explanation:
      "Como 3² + 4² = 5², o triângulo satisfaz o Teorema de Pitágoras e é retângulo.",
  },
];
const languageQuestions: QuizQuestion[] = [
  {
    subject: "Linguagens",
    prompt: "Em um texto argumentativo, a tese é:",
    options: [
      "O título do texto",
      "A ideia central defendida pelo autor",
      "Um exemplo secundário",
      "A referência bibliográfica",
    ],
    correct: 1,
    explanation:
      "A tese é o ponto de vista principal que organiza os argumentos do autor.",
  },
  {
    subject: "Linguagens",
    prompt: "A finalidade principal de uma notícia é:",
    options: [
      "Narrar um fato de interesse público",
      "Convencer o leitor a comprar",
      "Criar um personagem fictício",
      "Ensinar uma receita",
    ],
    correct: 0,
    explanation:
      "A notícia informa sobre um fato relevante, priorizando clareza e atualidade.",
  },
  {
    subject: "Linguagens",
    prompt: "A expressão 'por isso' geralmente introduz uma relação de:",
    options: ["Causa", "Oposição", "Conclusão", "Comparação"],
    correct: 2,
    explanation:
      "'Por isso' apresenta uma consequência ou conclusão derivada da ideia anterior.",
  },
  {
    subject: "Linguagens",
    prompt: "Inferir em uma leitura significa:",
    options: [
      "Copiar uma frase",
      "Construir um sentido a partir de pistas do texto",
      "Ignorar o contexto",
      "Ler somente as imagens",
    ],
    correct: 1,
    explanation:
      "Inferir é relacionar informações explícitas e conhecimento de contexto para chegar a uma conclusão.",
  },
  {
    subject: "Linguagens",
    prompt: "A repetição intencional de sons consonantais é chamada de:",
    options: ["Aliteração", "Metáfora", "Ironia", "Antítese"],
    correct: 0,
    explanation:
      "Aliteração é a repetição de fonemas consonantais para criar ritmo ou efeito sonoro.",
  },
  {
    subject: "Linguagens",
    prompt:
      "Em 'Estudei, portanto estou preparado', a palavra 'portanto' indica:",
    options: ["Adição", "Conclusão", "Explicação", "Condição"],
    correct: 1,
    explanation:
      "'Portanto' conecta a primeira ideia à conclusão apresentada na segunda oração.",
  },
];
const scienceQuestions: QuizQuestion[] = [
  {
    subject: "Ciências",
    prompt: "Na cadeia alimentar, os produtores são organismos que:",
    options: [
      "Produzem seu próprio alimento",
      "Alimentam-se de outros animais",
      "Decompõem matéria",
      "Vivem apenas na água",
    ],
    correct: 0,
    explanation:
      "Plantas e algas são produtores porque realizam fotossíntese e produzem matéria orgânica.",
  },
  {
    subject: "Ciências",
    prompt: "A água passa do estado líquido para o gasoso na:",
    options: ["Condensação", "Solidificação", "Evaporação", "Fusão"],
    correct: 2,
    explanation:
      "Evaporação é a passagem gradual do líquido para o vapor, geralmente com fornecimento de calor.",
  },
  {
    subject: "Ciências",
    prompt: "A principal função das raízes é:",
    options: [
      "Produzir sementes",
      "Fixar a planta e absorver água e sais",
      "Atrair polinizadores",
      "Realizar a respiração pulmonar",
    ],
    correct: 1,
    explanation:
      "As raízes sustentam a planta e absorvem água e sais minerais do solo.",
  },
  {
    subject: "Ciências",
    prompt: "Uma mudança que forma uma nova substância é uma transformação:",
    options: ["Física", "Química", "Temporária", "Mecânica"],
    correct: 1,
    explanation:
      "Na transformação química, a composição da matéria se altera e novas substâncias são formadas.",
  },
  {
    subject: "Ciências",
    prompt: "A unidade básica dos seres vivos é:",
    options: ["O tecido", "O órgão", "A célula", "O sistema"],
    correct: 2,
    explanation:
      "A célula é a menor unidade estrutural e funcional dos seres vivos.",
  },
  {
    subject: "Ciências",
    prompt: "O gás mais abundante na atmosfera terrestre é:",
    options: ["Oxigênio", "Nitrogênio", "Gás carbônico", "Hidrogênio"],
    correct: 1,
    explanation:
      "O nitrogênio representa aproximadamente 78% da atmosfera terrestre.",
  },
];

function questionsFor(
  profile: StudentProfile,
  kind: ActivityKind
): QuizQuestion[] {
  const base =
    profile.goal.includes("texto") || profile.goal.includes("Linguagens")
      ? languageQuestions
      : profile.goal.includes("Ciências")
        ? scienceQuestions
        : mathQuestions;
  if (kind === "simulado")
    return [
      ...mathQuestions.slice(0, 2),
      ...languageQuestions.slice(0, 2),
      ...scienceQuestions.slice(0, 2),
    ];
  const isEarlyFundamental =
    profile.grade.includes("6º") || profile.grade.includes("9º");
  return isEarlyFundamental ? base.slice(0, 4) : base;
}

function QuizRunner({
  kind,
  profile,
  onCancel,
  onComplete,
}: {
  kind: "quiz" | "simulado";
  profile: StudentProfile;
  onCancel: () => void;
  onComplete: (
    score: number,
    total: number,
    feedback: string,
    weakTopics: string
  ) => void;
}) {
  const questions = useMemo(
    () => questionsFor(profile, kind),
    [profile.goal, profile.grade, kind]
  );
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [wrongTopics, setWrongTopics] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);
  const question = questions[index];
  const isCorrect = selected === question?.correct;
  const score =
    answers.filter(Boolean).length + (selected !== null && isCorrect ? 1 : 0);

  function selectAnswer(choice: number) {
    if (selected !== null) return;
    setSelected(choice);
  }

  function next() {
    const nextAnswers = [...answers, isCorrect];
    setAnswers(nextAnswers);
    if (!isCorrect) setWrongTopics(current => [...current, question.prompt]);
    if (index === questions.length - 1) setFinished(true);
    else {
      setIndex(current => current + 1);
      setSelected(null);
    }
  }

  if (finished) {
    const finalScore = answers.filter(Boolean).length;
    const summary = `Você acertou ${finalScore} de ${questions.length}. ${finalScore === questions.length ? "Excelente domínio do conteúdo." : finalScore >= Math.ceil(questions.length / 2) ? "Você já tem uma boa base; revise os pontos indicados." : "Use os comentários para revisar os conceitos antes de tentar novamente."}`;
    return (
      <div className="quiz-runner rounded-[24px] border border-[#d7e3eb] bg-white p-6 text-[#19324a] lg:col-span-2">
        <SectionEyebrow>
          {kind === "quiz" ? "Quiz concluído" : "Simulado concluído"}
        </SectionEyebrow>
        <h2 className="mt-2 text-3xl font-bold text-[#102a43]">
          Seu resultado está pronto.
        </h2>
        <div className="mt-6 rounded-2xl bg-[#eaf4f3] p-5">
          <p className="text-4xl font-black text-[#087f8c]">
            {finalScore}/{questions.length}
          </p>
          <p className="mt-2 text-sm leading-6 text-[#5c7185]">{summary}</p>
          {wrongTopics.length > 0 && (
            <p className="mt-3 text-xs font-semibold text-[#b55242]">
              Focos para revisar: {wrongTopics.join(" · ")}
            </p>
          )}
        </div>
        <button
          onClick={() =>
            onComplete(
              finalScore,
              questions.length,
              summary,
              wrongTopics.join("|")
            )
          }
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#087f8c] px-5 py-3 font-bold text-white"
        >
          Salvar tentativa <Check className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-runner rounded-[24px] border border-[#d7e3eb] bg-white p-6 text-[#19324a] lg:col-span-2">
      <div className="flex items-center justify-between gap-4">
        <div>
          <SectionEyebrow>
            {kind === "quiz" ? "Quiz adaptado" : "Simulado adaptado"}
          </SectionEyebrow>
          <p className="mt-1 text-xs font-bold text-[#7d909d]">
            Questão {index + 1} de {questions.length} · {question.subject}
          </p>
        </div>
        <button onClick={onCancel} className="text-sm font-bold text-[#087f8c]">
          Sair
        </button>
      </div>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#e8eff1]">
        <div
          className="progress-fill progress-teal"
          style={{
            width: `${((index + (selected !== null ? 1 : 0)) / questions.length) * 100}%`,
          }}
        />
      </div>
      <h2 className="mt-7 text-xl font-bold leading-8 text-[#102a43]">
        {question.prompt}
      </h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {question.options.map((option, optionIndex) => (
          <button
            key={option}
            onClick={() => selectAnswer(optionIndex)}
            className={`rounded-xl border p-4 text-left text-sm font-semibold transition ${selected === optionIndex ? (optionIndex === question.correct ? "border-[#087f8c] bg-[#eaf4f3] text-[#05616b]" : "border-[#b55242] bg-[#fbe8e4] text-[#b55242]") : "border-[#d7e3eb] hover:border-[#087f8c]"}`}
          >
            {option}
            {selected === optionIndex &&
              (optionIndex === question.correct ? (
                <Check className="float-right size-4" />
              ) : (
                <X className="float-right size-4" />
              ))}
          </button>
        ))}
      </div>
      {selected !== null && (
        <div
          className={`mt-5 rounded-2xl p-5 ${isCorrect ? "bg-[#eaf4f3]" : "bg-[#fff3e5]"}`}
        >
          <p
            className={`font-bold ${isCorrect ? "text-[#087f8c]" : "text-[#b55242]"}`}
          >
            {isCorrect
              ? "Resposta correta."
              : `Resposta incorreta. A alternativa correta é: ${question.options[question.correct]}.`}
          </p>
          <p className="mt-2 text-sm leading-6 text-[#5c7185]">
            <strong className="text-[#19324a]">Por quê?</strong>{" "}
            {question.explanation}
          </p>
          <button
            onClick={next}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#102a43] px-4 py-2.5 text-sm font-bold text-white"
          >
            {index === questions.length - 1
              ? "Ver resultado"
              : "Próxima questão"}{" "}
            <ArrowRight className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function StudyPlanPanel({
  plan,
  items,
}: {
  plan?: { title: string; summary: string; weeklyMinutes: number };
  items: Array<{
    dayOrder: number;
    subject: string;
    title: string;
    activityKind: string;
    durationMinutes: number;
    rationale: string;
    completed: number;
  }>;
}) {
  return (
    <section className="mt-8 rounded-[24px] bg-[#102a43] p-6 text-white">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <SectionEyebrow dark>Plano personalizado</SectionEyebrow>
          <h2 className="text-2xl font-bold text-white">
            {plan?.title || "Seu plano será gerado no cadastro"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#aac0cd]">
            {plan?.summary ||
              "Conclua o diagnóstico durante o cadastro para receber uma semana de estudos baseada nos seus resultados."}
          </p>
        </div>
        <span className="rounded-full bg-[#f4b942] px-3 py-1.5 text-xs font-black text-[#102a43]">
          {plan ? `${plan.weeklyMinutes} min/semana` : "Aguardando diagnóstico"}
        </span>
      </div>
      {items.length > 0 && (
        <div className="mt-6 grid gap-3 md:grid-cols-5">
          {items.map(item => (
            <div
              key={item.dayOrder}
              className={`rounded-2xl p-4 ${item.completed ? "bg-[#087f8c]" : "bg-white/10"}`}
            >
              <p className="text-xs font-black uppercase tracking-widest text-[#f4b942]">
                Dia {item.dayOrder}
              </p>
              <h3 className="mt-3 text-sm font-bold text-white">
                {item.title}
              </h3>
              <p className="mt-2 text-xs text-[#c6d5df]">
                {item.durationMinutes} min · {item.activityKind}
              </p>
              <p className="mt-3 text-xs leading-5 text-[#aac0cd]">
                {item.rationale}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

type AttemptRecord = {
  activityKind: string;
  subject: string;
  score: number;
  total: number;
  feedback: string | null;
  weakTopics: string | null;
  completedAt: Date | string;
};

function HistoryPanel({ attempts }: { attempts: AttemptRecord[] }) {
  const [subject, setSubject] = useState("Todas");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const subjects = [
    "Todas",
    ...Array.from(new Set(attempts.map(attempt => attempt.subject))),
  ];
  const filtered = attempts.filter(attempt => {
    const date = new Date(attempt.completedAt).toISOString().slice(0, 10);
    return (
      (subject === "Todas" || attempt.subject === subject) &&
      (!from || date >= from) &&
      (!to || date <= to)
    );
  });
  const weakTopics = filtered.flatMap(attempt =>
    (attempt.weakTopics || "").split("|").filter(Boolean)
  );
  const latestWeakTopic = weakTopics[weakTopics.length - 1];
  return (
    <section className="mt-8 grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
      <div className="rounded-[24px] border border-[#d7e3eb] bg-white p-6">
        <SectionEyebrow>Próxima revisão</SectionEyebrow>
        <h2 className="text-2xl font-bold text-[#102a43]">
          Uma recomendação baseada nas suas respostas
        </h2>
        {filtered.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-[#d7e3eb] bg-[#f7fafc] p-5 text-sm leading-6 text-[#7d909d]">
            Ajuste os filtros ou conclua um quiz para receber uma recomendação
            baseada em evidências.
          </div>
        ) : (
          <div className="mt-5 rounded-2xl bg-[#fff3d6] p-5">
            <Target className="size-5 text-[#bd7418]" />
            <p className="mt-3 text-xs font-black uppercase tracking-widest text-[#bd7418]">
              Foco sugerido
            </p>
            <h3 className="mt-1 text-lg font-bold text-[#102a43]">
              {latestWeakTopic || "Consolidar o que você já aprendeu"}
            </h3>
            <p className="mt-2 text-sm leading-6 text-[#7d5b20]">
              Refaça um quiz curto sobre este tópico antes de avançar. A
              recomendação usa somente o recorte filtrado do seu histórico.
            </p>
          </div>
        )}
      </div>
      <div className="rounded-[24px] border border-[#d7e3eb] bg-white p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <SectionEyebrow>Histórico real</SectionEyebrow>
            <h2 className="text-2xl font-bold text-[#102a43]">
              Suas tentativas
            </h2>
          </div>
          <span className="rounded-full bg-[#eaf4f3] px-3 py-1.5 text-xs font-bold text-[#087f8c]">
            {filtered.length} de {attempts.length}
          </span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <select
            value={subject}
            onChange={event => setSubject(event.target.value)}
            className="entry-input"
          >
            <option value="Todas">Todas as disciplinas</option>
            {subjects
              .filter(item => item !== "Todas")
              .map(item => (
                <option key={item}>{item}</option>
              ))}
          </select>
          <label>
            <span className="profile-label">De</span>
            <input
              type="date"
              value={from}
              onChange={event => setFrom(event.target.value)}
              className="entry-input"
            />
          </label>
          <label>
            <span className="profile-label">Até</span>
            <input
              type="date"
              value={to}
              onChange={event => setTo(event.target.value)}
              className="entry-input"
            />
          </label>
        </div>
        {filtered.length === 0 ? (
          <p className="mt-6 text-sm leading-6 text-[#7d909d]">
            Nenhuma tentativa encontrada neste período ou disciplina.
          </p>
        ) : (
          <div className="mt-5 space-y-3">
            {filtered.slice(0, 10).map((attempt, index) => (
              <div
                key={`${attempt.completedAt}-${index}`}
                className="rounded-xl bg-[#f7fafc] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-black uppercase tracking-widest text-[#087f8c]">
                      {attempt.activityKind === "simulado"
                        ? "Simulado"
                        : "Quiz"}{" "}
                      ·{" "}
                      {new Date(attempt.completedAt).toLocaleDateString(
                        "pt-BR"
                      )}
                    </span>
                    <h3 className="mt-1 font-bold text-[#102a43]">
                      {attempt.subject}
                    </h3>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-[#102a43]">
                    {attempt.score}/{attempt.total}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-[#5c7185]">
                  {attempt.feedback || "Tentativa concluída e salva."}
                </p>
                {attempt.weakTopics && (
                  <p className="mt-2 text-xs font-semibold text-[#b55242]">
                    Para revisar: {attempt.weakTopics.split("|").join(" · ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function LockedDiagnosticScreen({
  onLogout,
}: {
  onLogout: () => Promise<void>;
}) {
  return (
    <div className="entry-shell min-h-screen bg-[#102a43] text-white">
      <div className="hero-grid absolute inset-0 opacity-30" />
      <div className="relative mx-auto flex min-h-screen max-w-3xl items-center justify-center px-5 py-10">
        <div className="w-full rounded-[28px] bg-[#f7fafc] p-7 text-[#19324a] shadow-2xl sm:p-10">
          <div className="flex items-center justify-between">
            <Logo />
            <button
              onClick={onLogout}
              className="text-sm font-bold text-[#b55242]"
            >
              Sair da conta
            </button>
          </div>
          <div className="mt-12 max-w-xl">
            <SectionEyebrow>Antes de começar</SectionEyebrow>
            <h1 className="mt-3 font-display text-5xl font-medium leading-[.98] tracking-[-.07em] text-[#102a43]">
              Seu caminho começa com um diagnóstico,{" "}
              <em className="text-[#087f8c]">não com uma tarefa.</em>
            </h1>
            <p className="mt-5 text-base leading-7 text-[#5c7185]">
              Vamos conhecer seu momento durante o cadastro para que aulas,
              quizzes, simulados, progresso e recomendações façam sentido desde
              o primeiro acesso.
            </p>
            <div className="mt-7 rounded-2xl bg-[#eaf4f3] p-5">
              <p className="text-sm font-bold text-[#102a43]">
                O diagnóstico ainda não foi concluído.
              </p>
              <p className="mt-2 text-sm leading-6 text-[#5c7185]">
                Nenhum módulo foi liberado e nenhum dado de desempenho foi
                criado. Saia e entre novamente pelo cadastro para concluir essa
                etapa.
              </p>
            </div>
            <button
              onClick={onLogout}
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#087f8c] px-5 py-3.5 font-bold text-white shadow-[0_5px_0_#05616b]"
            >
              Voltar para entrada <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
