import { useEffect, useState } from "react";

type Topic = { key: string; title: string; objective: string };
type Subject = { name: string; topics: Topic[] };
type Attempt = { id: string; activityKey: string; status: string };
type Props = { grade: string; onActivityChanged: () => Promise<void> };
const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export default function Curriculum({ grade, onActivityChanged }: Props) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [attempts, setAttempts] = useState<Record<string, Attempt>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyKey, setBusyKey] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true); setError("");
    fetch(API + "/api/curriculum?grade=" + encodeURIComponent(grade))
      .then(async response => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error ?? "Não foi possível carregar o currículo.");
        return body as { subjects: Subject[] };
      })
      .then(body => { if (alive) setSubjects(body.subjects); })
      .catch(e => { if (alive) setError(e instanceof Error ? e.message : "Erro ao carregar currículo."); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [grade]);

  async function start(topic: Topic) {
    setBusyKey(topic.key); setError("");
    try {
      const response = await fetch(API + "/api/activities/start", { method:"POST", credentials:"include", headers:{"Content-Type":"application/json"}, body:JSON.stringify({activityKey:topic.key}) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Não foi possível iniciar a atividade.");
      setAttempts(current => ({...current,[topic.key]:body.attempt}));
      await onActivityChanged();
    } catch(e) { setError(e instanceof Error ? e.message : "Erro ao iniciar atividade."); }
    finally { setBusyKey(""); }
  }

  async function complete(topic: Topic) {
    const attempt = attempts[topic.key];
    if (!attempt) return;
    setBusyKey(topic.key); setError("");
    try {
      const response = await fetch(API + "/api/activities/" + encodeURIComponent(attempt.id) + "/complete", { method:"POST", credentials:"include" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Não foi possível concluir a atividade.");
      setAttempts(current => ({...current,[topic.key]:body.attempt}));
      await onActivityChanged();
    } catch(e) { setError(e instanceof Error ? e.message : "Erro ao concluir atividade."); }
    finally { setBusyKey(""); }
  }

  return <section className="content-card curriculum-card" id="trilhas">
    <p className="eyebrow">TRILHAS DE APRENDIZAGEM</p>
    <h2>Explore sua série</h2>
    <p className="muted">Tópicos curriculares iniciais para orientar a jornada. A seleção será expandida e revisada por série nas próximas etapas.</p>
    {loading && <p className="muted">Carregando trilhas...</p>}
    {error && <p className="message error" role="alert">{error}</p>}
    {!loading && subjects.map(subject => <details className="subject-group" key={subject.name} open>
      <summary>{subject.name}<span>{subject.topics.length} tópicos</span></summary>
      <div className="topic-list">{subject.topics.map(topic => {
        const attempt = attempts[topic.key];
        const completed = attempt?.status === "COMPLETED";
        const inProgress = attempt?.status === "IN_PROGRESS";
        return <article className="topic-item" key={topic.key}>
          <div><strong>{topic.title}</strong><p>{topic.objective}</p></div>
          {completed ? <span className="topic-status">Concluída nesta sessão</span> : inProgress ?
            <button className="small-action" disabled={busyKey===topic.key} onClick={()=>complete(topic)}>{busyKey===topic.key?"Salvando...":"Marcar concluída"}</button> :
            <button className="small-action" disabled={Boolean(busyKey)} onClick={()=>start(topic)}>{busyKey===topic.key?"Iniciando...":"Começar"}</button>}
        </article>;
      })}</div>
    </details>)}
  </section>;
}