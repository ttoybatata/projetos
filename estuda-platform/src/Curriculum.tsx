import { useEffect, useState } from "react";

type Topic = { key: string; title: string; objective: string };
type Subject = { name: string; topics: Topic[] };
type Attempt = { id: string; activityKey: string; status: string; score?: number | null };
type QuizQuestion = { id: string; prompt: string; choices: string[] };
type Quiz = { activityKey: string; questions: QuizQuestion[] };
type QuizResult = {
  correctCount: number;
  total: number;
  score: number;
  details: { id: string; correct: boolean; correctIndex: number; explanation: string }[];
};
type Props = { grade: string; activities: Attempt[]; onActivityChanged: () => Promise<void> };
const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export default function Curriculum({ grade, activities, onActivityChanged }: Props) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [attempts, setAttempts] = useState<Record<string, Attempt>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyKey, setBusyKey] = useState("");
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [activeAttempt, setActiveAttempt] = useState<Attempt | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [guidedTopicKey, setGuidedTopicKey] = useState("");

  useEffect(() => {
    const restored: Record<string, Attempt> = {};
    for (const activity of activities) {
      if (!restored[activity.activityKey]) restored[activity.activityKey] = activity;
    }
    setAttempts(restored);
  }, [activities]);

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

  function clearActive() {
    setActiveQuiz(null); setActiveAttempt(null); setSelectedAnswers({}); setQuizResult(null); setGuidedTopicKey("");
  }

  async function openActivity(topic: Topic, attempt?: Attempt) {
    setBusyKey(topic.key); setError(""); setNotice(""); clearActive();
    try {
      let currentAttempt = attempt;
      if (!currentAttempt) {
        const response = await fetch(API + "/api/activities/start", {
          method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ activityKey: topic.key })
        });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error ?? "Não foi possível iniciar a atividade.");
        currentAttempt = body.attempt as Attempt;
        setAttempts(current => ({ ...current, [topic.key]: currentAttempt! }));
        await onActivityChanged();
      }
      setActiveAttempt(currentAttempt!);
      const response = await fetch(API + "/api/activities/" + encodeURIComponent(topic.key) + "/quiz", { credentials: "include" });
      const body = await response.json();
      if (response.ok) {
        setActiveQuiz(body as Quiz);
        setNotice("Responda às questões. A correção e a pontuação são calculadas pelo servidor.");
      } else if (response.status === 404) {
        setGuidedTopicKey(topic.key);
        setNotice("Este tópico ainda não tem questões com correção automática. Estude o objetivo e registre a conclusão guiada quando estiver pronto.");
      } else {
        throw new Error(body.error ?? "Não foi possível abrir a atividade.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao abrir atividade.");
    } finally { setBusyKey(""); }
  }

  async function completeGuided(topic: Topic) {
    const attempt = activeAttempt ?? attempts[topic.key];
    if (!attempt) return;
    setBusyKey(topic.key); setError(""); setNotice("");
    try {
      const response = await fetch(API + "/api/activities/" + encodeURIComponent(attempt.id) + "/complete", {
        method: "POST", credentials: "include"
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Não foi possível concluir a atividade.");
      setAttempts(current => ({ ...current, [topic.key]: body.attempt }));
      setGuidedTopicKey("");
      setNotice("Conclusão guiada registrada. Esta atividade não recebeu nota automática.");
      await onActivityChanged();
    } catch (e) { setError(e instanceof Error ? e.message : "Erro ao concluir atividade."); }
    finally { setBusyKey(""); }
  }

  async function submitQuiz(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeQuiz || !activeAttempt || quizResult || busyKey) return;
    if (activeQuiz.questions.some(question => selectedAnswers[question.id] === undefined)) {
      setError("Responda a todas as questões antes de enviar.");
      return;
    }
    setBusyKey(activeQuiz.activityKey); setError(""); setNotice("");
    try {
      const response = await fetch(API + "/api/activities/" + encodeURIComponent(activeAttempt.id) + "/submit", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: selectedAnswers })
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Não foi possível corrigir a atividade.");
      setQuizResult(body.result as QuizResult);
      setAttempts(current => ({ ...current, [activeQuiz.activityKey]: body.attempt }));
      setNotice("Respostas corrigidas. Veja o resultado e as explicações abaixo.");
      await onActivityChanged();
    } catch (e) { setError(e instanceof Error ? e.message : "Erro ao enviar respostas."); }
    finally { setBusyKey(""); }
  }

  return <section className="content-card curriculum-card" id="trilhas">
    <p className="eyebrow">TRILHAS DE APRENDIZAGEM</p>
    <h2>Explore sua série</h2>
    <p className="muted">Tópicos curriculares iniciais para orientar a jornada. A seleção será expandida e revisada por série nas próximas etapas.</p>
    {loading && <p className="muted">Carregando trilhas...</p>}
    {error && <p className="message error" role="alert">{error}</p>}
    {notice && <p className="message" role="status">{notice}</p>}
    {!loading && subjects.map(subject => <details className="subject-group" key={subject.name} open>
      <summary>{subject.name}<span>{subject.topics.length} tópicos</span></summary>
      <div className="topic-list">{subject.topics.map(topic => {
        const attempt = attempts[topic.key];
        const completed = attempt?.status === "COMPLETED";
        const inProgress = attempt?.status === "IN_PROGRESS";
        const showing = activeAttempt?.activityKey === topic.key;
        return <article className="topic-item" key={topic.key}>
          <div><strong>{topic.title}</strong><p>{topic.objective}</p>
            {completed && typeof attempt.score === "number" && <p className="topic-score">Resultado do quiz: {attempt.score}%</p>}
          </div>
          {completed ? <span className="topic-status">Concluída</span> :
            <button className="small-action" disabled={Boolean(busyKey)} onClick={() => openActivity(topic, inProgress ? attempt : undefined)}>
              {busyKey === topic.key ? "Abrindo..." : inProgress ? "Continuar atividade" : "Começar"}
            </button>}
          {showing && activeQuiz && !quizResult && <form className="quiz-panel" onSubmit={submitQuiz}>
            <h3>Hora de praticar</h3>
            {activeQuiz.questions.map((question, index) => <fieldset className="quiz-question" key={question.id}>
              <legend>{index + 1}. {question.prompt}</legend>
              {question.choices.map((choice, choiceIndex) => <label className="quiz-choice" key={choice}>
                <input type="radio" name={question.id} value={choiceIndex} checked={selectedAnswers[question.id] === choiceIndex}
                  onChange={() => setSelectedAnswers(current => ({ ...current, [question.id]: choiceIndex }))} />
                <span>{choice}</span>
              </label>)}
            </fieldset>)}
            <button className="primary-button" disabled={Boolean(busyKey)}>{busyKey ? "Corrigindo..." : "Enviar respostas"}</button>
          </form>}
          {showing && quizResult && <div className="quiz-result" role="status">
            <h3>Você acertou {quizResult.correctCount} de {quizResult.total}</h3>
            <p className="quiz-score">{quizResult.score}% de aproveitamento</p>
            {activeQuiz?.questions.map((question, index) => {
              const detail = quizResult.details.find(item => item.id === question.id);
              return <div className="quiz-feedback" key={question.id}>
                <strong>{detail?.correct ? "Resposta correta" : "Revise esta questão"} — Questão {index + 1}</strong>
                {!detail?.correct && <p>Resposta esperada: {question.choices[detail?.correctIndex ?? 0]}</p>}
                <p>{detail?.explanation}</p>
              </div>;
            })}
            <button type="button" className="small-action" onClick={clearActive}>Fechar resultado</button>
          </div>}
          {showing && guidedTopicKey === topic.key && <div className="guided-panel">
            <p>Leia o objetivo acima e tente explicar o conceito com suas próprias palavras antes de concluir.</p>
            <button type="button" className="small-action" disabled={Boolean(busyKey)} onClick={() => completeGuided(topic)}>
              {busyKey === topic.key ? "Salvando..." : "Registrar conclusão guiada"}
            </button>
          </div>}
        </article>;
      })}</div>
    </details>)}
  </section>;
}
