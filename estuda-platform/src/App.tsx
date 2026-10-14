import { useEffect, useState, type FormEvent } from "react";
import Curriculum from "./Curriculum";

type User = { id: string; displayName: string; schoolYear?: string | null; readingFluency?: string | null; learningGoals?: string[]; diagnostic?: { completedAt: string } | null };
type Dashboard = { activities: { id: string; activityKey: string; status: string; score: number | null }[]; stats: { completedCount: number; totalStudyMinutes: number }; hasActivity: boolean; diagnosticCompletedAt: string | null };
const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(API + path, { ...options, credentials: "include", headers: { "Content-Type": "application/json", ...options.headers } });
  const body = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(body?.error ?? "Não foi possível concluir a operação.");
  return body as T;
}
const grades = [{value:"6EF",label:"6º ano do Ensino Fundamental"},{value:"7EF",label:"7º ano do Ensino Fundamental"},{value:"8EF",label:"8º ano do Ensino Fundamental"},{value:"9EF",label:"9º ano do Ensino Fundamental"},{value:"1EM",label:"1º ano do Ensino Médio"},{value:"2EM",label:"2º ano do Ensino Médio"},{value:"3EM",label:"3º ano do Ensino Médio"}];
const goals = [{value:"melhorar_estudos",label:"Melhorar minha qualidade de estudo"},{value:"aprender",label:"Aprender coisas novas"},{value:"recuperar_conteudo",label:"Recuperar conteúdos que perdi"},{value:"provas_enem",label:"Preparar-me para provas e ENEM"}];

export default function App() {
  const [user,setUser] = useState<User|null>(null);
  const [dashboard,setDashboard] = useState<Dashboard|null>(null);
  const [mode,setMode] = useState<"login"|"register"|"recover">("register");
  const [error,setError] = useState("");
  const [notice,setNotice] = useState("");
  const [busy,setBusy] = useState(false);
  const [recoveryCode,setRecoveryCode] = useState("");
  const [answer,setAnswer] = useState("");
  async function refresh() { const me = await request<User>("/api/me"); setUser(me); setDashboard(await request<Dashboard>("/api/dashboard")); }
  async function reloadDashboard() { if (user) setDashboard(await request<Dashboard>("/api/dashboard")); }
  useEffect(()=>{ refresh().catch(()=>undefined); },[]);
  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setNotice(""); setRecoveryCode("");
    const form = new FormData(event.currentTarget);
    const displayName = String(form.get("displayName") ?? "");
    const password = String(form.get("password") ?? "");
    const payload: Record<string,unknown> = { displayName, password };
    if(mode==="register") {
      if(password!==form.get("confirmPassword")) { setError("As senhas não coincidem."); setBusy(false); return; }
      const learningGoals = form.getAll("learningGoals");
      if(learningGoals.length===0) { setError("Selecione pelo menos um objetivo para personalizar seus estudos."); setBusy(false); return; }
      payload.schoolYear=form.get("schoolYear"); payload.readingFluency=form.get("readingFluency"); payload.learningGoals=learningGoals;
    }
    if(mode==="recover") {
      const newPassword = String(form.get("newPassword") ?? "");
      if(newPassword!==form.get("confirmPassword")) { setError("As senhas não coincidem."); setBusy(false); return; }
      try {
        const result=await request<{user:User;recoveryCode:string;notice:string}>("/api/auth/recover",{method:"POST",body:JSON.stringify({displayName,recoveryCode:form.get("recoveryCode"),newPassword})});
        setUser(result.user); setRecoveryCode(result.recoveryCode); setNotice(result.notice); setDashboard(await request<Dashboard>("/api/dashboard"));
      } catch(e) { setError(e instanceof Error?e.message:"Não foi possível recuperar a conta."); }
      finally { setBusy(false); }
      return;
    }
    try {
      const result=await request<{user:User;recoveryCode?:string;notice?:string}>("/api/auth/"+(mode==="register"?"register":"login"),{method:"POST",body:JSON.stringify(payload)});
      setUser(result.user); setRecoveryCode(result.recoveryCode??""); setNotice(result.notice??"Você entrou no Estuda!"); setDashboard(await request<Dashboard>("/api/dashboard"));
    } catch(e) { setError(e instanceof Error?e.message:"Falha ao entrar."); } finally { setBusy(false); }
  }
  async function saveDiagnostic(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setNotice("");
    try { await request("/api/diagnostic",{method:"PUT",body:JSON.stringify({answers:{confidence:answer}})}); setNotice("Diagnóstico salvo. Ele será usado nas próximas etapas de personalização."); await refresh(); }
    catch(e) { setError(e instanceof Error?e.message:"Não foi possível salvar o diagnóstico."); }
  }
  async function saveProfile(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setNotice(""); setBusy(true);
    const form = new FormData(event.currentTarget);
    const learningGoals = form.getAll("profileLearningGoals");
    try {
      const result = await request<{user:User}>("/api/me", {method:"PATCH", body:JSON.stringify({
        displayName:form.get("profileDisplayName"), schoolYear:form.get("profileSchoolYear"),
        readingFluency:form.get("profileReadingFluency"), learningGoals
      })});
      setUser(result.user); setNotice("Configurações do perfil salvas.");
    } catch(e) { setError(e instanceof Error?e.message:"Não foi possível salvar o perfil."); }
    finally { setBusy(false); }
  }
  async function logout() { await request("/api/auth/logout",{method:"POST"}); setUser(null); setDashboard(null); setNotice("Você saiu da sua conta."); }
  if(!user) return <main className="auth-shell"><section className="brand-panel"><div className="brand-mark">E</div><p className="eyebrow">SUA JORNADA, SEU RITMO</p><h1>Aprender fica melhor quando o caminho é seu.</h1><p>Uma plataforma que organiza seus estudos a partir da sua série, dos seus objetivos e do que você realmente pratica.</p><div className="grade-pill">6º ano EF — 3º ano EM</div></section><section className="auth-panel"><div className="auth-card"><p className="eyebrow">BEM-VINDO AO ESTUDA</p><h2>{mode==="register"?"Vamos começar?":mode==="recover"?"Recupere sua conta":"Que bom ter você de volta."}</h2><p className="muted">{mode==="register"?"Crie sua conta para iniciar seu percurso de aprendizagem.":mode==="recover"?"Use seu nome de usuário e o código recebido ao criar a conta.":"Entre com seu nome de usuário e senha."}</p>{mode==="recover"?<div className="mode-switch"><button className="selected" type="button" onClick={()=>setMode("login")}>Voltar para entrar</button></div>:<div className="mode-switch"><button type="button" className={mode==="register"?"selected":""} onClick={()=>{setMode("register");setError("");setNotice("");}}>Criar conta</button><button type="button" className={mode==="login"?"selected":""} onClick={()=>{setMode("login");setError("");setNotice("");}}>Entrar</button></div>}<form onSubmit={submitAuth} className="form-stack"><label>Nome de usuário<input name="displayName" minLength={2} maxLength={60} required autoComplete="username" placeholder="Como podemos te chamar?"/></label><label>{mode==="recover"?"Nova senha":"Senha"}<input name={mode==="recover"?"newPassword":"password"} type="password" minLength={8} required autoComplete={mode==="login"?"current-password":"new-password"} placeholder="Mínimo de 8 caracteres"/></label>{mode==="recover"&&<><label>Código de recuperação<input name="recoveryCode" required minLength={10} maxLength={64} autoComplete="off" placeholder="Digite seu código"/></label><label>Confirme a nova senha<input name="confirmPassword" type="password" minLength={8} required autoComplete="new-password"/></label></>}{mode==="register"&&<><label>Em qual série você está?<select name="schoolYear" required defaultValue="6EF">{grades.map(g=><option key={g.value} value={g.value}>{g.label}</option>)}</select></label><label>Como você se sente em relação à leitura?<select name="readingFluency" required defaultValue="intermediaria"><option value="preciso_praticar">Quero praticar mais</option><option value="intermediaria">Leio, mas às vezes tenho dificuldade</option><option value="fluente">Leio com fluência</option></select></label><fieldset><legend>O que você quer alcançar?</legend>{goals.map(g=><label className="check-row" key={g.value}><input type="checkbox" name="learningGoals" value={g.value}/>{g.label}</label>)}</fieldset><label>Confirme sua senha<input name="confirmPassword" type="password" minLength={8} required autoComplete="new-password" placeholder="Digite a senha novamente"/></label></>}{error&&<p className="message error" role="alert">{error}</p>}{notice&&<p className="message success" role="status">{notice}</p>}{recoveryCode&&<div className="recovery-box"><strong>Seu código de recuperação</strong><code>{recoveryCode}</code><p>Guarde este código em local seguro. Após recuperar a conta, o código anterior deixa de funcionar.</p></div>}<button className="primary-button" disabled={busy}>{busy?"Aguarde...":mode==="register"?"Criar minha conta":mode==="recover"?"Redefinir senha":"Entrar no Estuda"}</button>{mode==="login"&&<button type="button" className="text-button" onClick={()=>{setMode("recover");setError("");setNotice("");}}>Esqueci minha senha</button>}</form><p className="privacy-note">Seus dados devem apoiar seu estudo, não inventar resultados. Nunca compartilhe sua senha.</p></div></section></main>;
  return <main className="app-shell"><header className="topbar"><a className="brand" href="#"><span className="brand-mark small">E</span> Estuda</a><div className="user-menu"><span>Olá, {user.displayName} 👋</span><button className="quiet-button" onClick={logout}>Sair</button></div></header><div className="dashboard-layout"><aside className="sidebar"><p className="eyebrow">SEU ESPAÇO</p><a className="nav-item active" href="#inicio">⌂ <span>Visão geral</span></a><a className="nav-item" href="#trilhas">▦ <span>Trilhas</span></a><a className="nav-item" href="#diagnostico">◉ <span>Meu diagnóstico</span></a><a className="nav-item" href="#atividades">▤ <span>Atividades</span></a><a className="nav-item" href="#configuracoes">⚙ <span>Configurações</span></a></aside><section className="main-content" id="inicio"><p className="eyebrow">PAINEL DO ALUNO</p><h1>Seu próximo passo começa aqui.</h1><p className="muted">Uma jornada de aprendizagem construída no seu ritmo.</p><div className="stats-grid"><article className="stat-card"><span>Atividades concluídas</span><strong>{dashboard?.stats.completedCount??"—"}</strong><small>Registros reais</small></article><article className="stat-card"><span>Tempo de estudo</span><strong>{dashboard?.stats.totalStudyMinutes??"—"} min</strong><small>Calculado a partir de sessões registradas</small></article><article className="stat-card"><span>Diagnóstico</span><strong>{dashboard?.diagnosticCompletedAt?"Iniciado":"Pendente"}</strong><small>Ajuda a personalizar o percurso</small></article></div>{!dashboard?.hasActivity?<article className="empty-state" id="atividades"><div className="empty-icon">✦</div><h2>Sua história de estudos começa agora.</h2><p>Ainda não há atividades registradas. Quando você estudar e concluir atividades, este painel mostrará dados reais — sem números inventados.</p></article>:<article className="content-card" id="atividades"><h2>Atividades recentes</h2>{dashboard.activities.map(a=><div className="activity-row" key={a.id}><span>{a.activityKey}</span><span>{a.status==="COMPLETED"?"Concluída":"Pendente"}</span></div>)}</article>}<Curriculum grade={user.schoolYear ?? "6EF"} activities={dashboard?.activities ?? []} onActivityChanged={reloadDashboard}/><article className="content-card diagnostic-card" id="diagnostico"><div><p className="eyebrow">PRIMEIRO PASSO</p><h2>Vamos entender como você aprende?</h2><p className="muted">Este diagnóstico inicial é uma base. A versão adaptativa terá perguntas por série, leitura, matemática e objetivos.</p></div><form onSubmit={saveDiagnostic} className="form-stack"><label>Como você se sente ao estudar um assunto novo?<select required value={answer} onChange={e=>setAnswer(e.target.value)}><option value="">Escolha uma opção</option><option value="preciso_de_explicacao">Preciso que expliquem passo a passo</option><option value="aprendo_com_exemplos">Aprendo melhor com exemplos</option><option value="consigo_praticar">Aprendo praticando exercícios</option></select></label><button className="primary-button" disabled={!answer}>Salvar diagnóstico</button></form></article><article className="content-card" id="configuracoes"><h2>Configurações da conta</h2><p className="muted">Atualize seus dados para manter as trilhas e recomendações alinhadas à sua realidade.</p><form onSubmit={saveProfile} className="form-stack profile-form"><label>Nome de usuário<input name="profileDisplayName" minLength={2} maxLength={60} required defaultValue={user.displayName} autoComplete="username"/></label><label>Série<select name="profileSchoolYear" required defaultValue={user.schoolYear??"6EF"}>{grades.map(g=><option key={g.value} value={g.value}>{g.label}</option>)}</select></label><label>Fluência de leitura<select name="profileReadingFluency" required defaultValue={user.readingFluency??"intermediaria"}><option value="preciso_praticar">Quero praticar mais</option><option value="intermediaria">Leio, mas às vezes tenho dificuldade</option><option value="fluente">Leio com fluência</option></select></label><fieldset><legend>Objetivos de aprendizagem</legend>{goals.map(g=><label className="check-row" key={g.value}><input type="checkbox" name="profileLearningGoals" value={g.value} defaultChecked={user.learningGoals?.includes(g.value)??false}/>{g.label}</label>)}</fieldset><button className="primary-button" disabled={busy}>{busy?"Salvando...":"Salvar configurações"}</button></form></article>{error&&<p className="message error" role="alert">{error}</p>}{notice&&<p className="message success" role="status">{notice}</p>}</section></div></main>;
}