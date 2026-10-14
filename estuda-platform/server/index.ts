import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomBytes, createHash, timingSafeEqual } from "node:crypto";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { curriculum, schoolYears } from "../shared/curriculum.js";
import { quizzes } from "../shared/activities.js";

const app = express();
const prisma = new PrismaClient();
const port = Number(process.env.PORT ?? 3000);
const webOrigin = process.env.WEB_ORIGIN || (process.env.NODE_ENV === "production" ? false : "http://localhost:5173");
if (process.env.NODE_ENV === "production" && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) {
  throw new Error("JWT_SECRET precisa ter pelo menos 32 caracteres em produção.");
}
const secret = process.env.JWT_SECRET ?? "dev-only-secret-change-this-before-production-123";
app.use(helmet());
app.use(cors({ origin: webOrigin, credentials: true }));
app.use(express.json({ limit: "32kb" }));
app.use(cookieParser());
app.use("/api/auth", rateLimit({ windowMs: 900000, limit: 30, standardHeaders: true, legacyHeaders: false }));
app.use("/api/tutor", rateLimit({ windowMs: 60000, limit: 12, standardHeaders: true, legacyHeaders: false }));

function requireSession(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.cookies?.estuda_session;
  if (!token) return res.status(401).json({ error: "Faça login para continuar." });
  try { res.locals.userId = (jwt.verify(token, secret) as { userId: string }).userId; return next(); }
  catch { return res.status(401).json({ error: "Sessão expirada. Entre novamente." }); }
}
function issueSession(res: express.Response, userId: string) {
  res.cookie("estuda_session", jwt.sign({ userId }, secret, { expiresIn: "2h" }), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 7200000
  });
}
const registerSchema = z.object({
  displayName: z.string().trim().min(2).max(60),
  password: z.string().min(8).max(72),
  schoolYear: z.enum(["6EF", "7EF", "8EF", "9EF", "1EM", "2EM", "3EM"]),
  readingFluency: z.enum(["preciso_praticar", "intermediaria", "fluente"]),
  learningGoals: z.array(z.enum(["melhorar_estudos", "aprender", "recuperar_conteudo", "provas_enem"])).min(1).max(4)
});
const loginSchema = z.object({ displayName: z.string().trim().min(2).max(60), password: z.string().min(1).max(72) });
const recoverySchema = z.object({
  displayName: z.string().trim().min(2).max(60),
  recoveryCode: z.string().trim().min(10).max(64),
  newPassword: z.string().min(8).max(72)
});
const profileSchema = z.object({
  displayName: z.string().trim().min(2).max(60),
  schoolYear: z.enum(["6EF", "7EF", "8EF", "9EF", "1EM", "2EM", "3EM"]),
  readingFluency: z.enum(["preciso_praticar", "intermediaria", "fluente"]),
  learningGoals: z.array(z.enum(["melhorar_estudos", "aprender", "recuperar_conteudo", "provas_enem"])).min(1).max(4)
});
const diagnosticSchema = z.object({ answers: z.record(z.string(), z.union([z.string().max(500), z.number(), z.boolean()])) });

app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "estuda-api" }));

app.get("/api/curriculum", (req, res) => {
  const parsedGrade = z.enum(schoolYears).safeParse(req.query.grade);
  if (!parsedGrade.success) return res.status(400).json({ error: "Informe uma série válida entre 6º EF e 3º EM." });
  return res.json({ grade: parsedGrade.data, subjects: curriculum[parsedGrade.data] });
});

app.get("/api/activities/:activityKey/quiz", requireSession, async (req, res, next) => {
  try {
    const parsedKey = z.string().min(1).max(100).safeParse(req.params.activityKey);
    if (!parsedKey.success) return res.status(400).json({ error: "Atividade inválida." });
    const user = await prisma.user.findUnique({ where: { id: res.locals.userId }, select: { schoolYear: true } });
    if (!user?.schoolYear || !schoolYears.includes(user.schoolYear as typeof schoolYears[number])) {
      return res.status(400).json({ error: "Defina sua série antes de abrir uma atividade." });
    }
    const topics = curriculum[user.schoolYear as typeof schoolYears[number]].flatMap(subject => subject.topics);
    if (!topics.some(topic => topic.key === parsedKey.data)) return res.status(404).json({ error: "Atividade não encontrada para esta série." });
    const quiz = quizzes[parsedKey.data];
    if (!quiz) return res.status(404).json({ error: "Esta atividade ainda não tem questões com correção automática. Você pode estudar o tópico e registrar a conclusão guiada." });
    return res.json({
      activityKey: quiz.activityKey,
      questions: quiz.questions.map(({ id, prompt, choices }) => ({ id, prompt, choices }))
    });
  } catch (error) { return next(error); }
});

app.post("/api/activities/:id/submit", requireSession, async (req, res, next) => {
  try {
    const parsedId = z.string().min(1).max(100).safeParse(req.params.id);
    const parsedBody = z.object({
      answers: z.record(z.string(), z.number().int().min(0).max(20)).refine(value => Object.keys(value).length <= 20)
    }).safeParse(req.body);
    if (!parsedId.success || !parsedBody.success) return res.status(400).json({ error: "Respostas inválidas. Revise as opções e tente novamente." });
    const attempt = await prisma.activityAttempt.findFirst({
      where: { id: parsedId.data, userId: res.locals.userId }
    });
    if (!attempt) return res.status(404).json({ error: "Sessão de atividade não encontrada." });
    if (attempt.status === "COMPLETED") return res.status(409).json({ error: "Esta tentativa já foi enviada." });
    const user = await prisma.user.findUnique({ where: { id: res.locals.userId }, select: { schoolYear: true } });
    if (!user?.schoolYear || !schoolYears.includes(user.schoolYear as typeof schoolYears[number]) ||
        !curriculum[user.schoolYear as typeof schoolYears[number]].some(subject => subject.topics.some(topic => topic.key === attempt.activityKey))) {
      return res.status(403).json({ error: "Esta atividade não pertence à série atual da sua conta." });
    }
    const quiz = quizzes[attempt.activityKey];
    if (!quiz) return res.status(404).json({ error: "Esta atividade não possui correção automática." });
    const expectedIds = quiz.questions.map(question => question.id);
    if (Object.keys(parsedBody.data.answers).length !== expectedIds.length ||
        expectedIds.some(id => !Object.prototype.hasOwnProperty.call(parsedBody.data.answers, id)) ||
        quiz.questions.some(question => parsedBody.data.answers[question.id] >= question.choices.length)) {
      return res.status(400).json({ error: "Responda a todas as questões usando uma das opções disponíveis." });
    }
    const details = quiz.questions.map(question => ({
      id: question.id,
      correct: parsedBody.data.answers[question.id] === question.correctIndex,
      correctIndex: question.correctIndex,
      explanation: question.explanation
    }));
    const correctCount = details.filter(item => item.correct).length;
    const score = Math.round((correctCount / quiz.questions.length) * 100);
    const completed = await prisma.activityAttempt.update({
      where: { id: attempt.id },
      data: {
        status: "COMPLETED",
        score,
        answers: JSON.stringify(parsedBody.data.answers),
        completedAt: new Date()
      },
      select: { id: true, activityKey: true, status: true, score: true, startedAt: true, completedAt: true }
    });
    return res.json({ attempt: completed, result: { correctCount, total: quiz.questions.length, score, details } });
  } catch (error) { return next(error); }
});

app.post("/api/activities/start", requireSession, async (req, res, next) => {
  try {
    const parsed = z.object({ activityKey: z.string().min(1).max(100) }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Atividade inválida." });
    const user = await prisma.user.findUnique({ where: { id: res.locals.userId }, select: { schoolYear: true } });
    if (!user?.schoolYear || !schoolYears.includes(user.schoolYear as typeof schoolYears[number])) return res.status(400).json({ error: "Defina sua série antes de iniciar uma atividade." });
    const topics = curriculum[user.schoolYear as typeof schoolYears[number]].flatMap(subject => subject.topics);
    if (!topics.some(item => item.key === parsed.data.activityKey)) return res.status(404).json({ error: "Atividade não encontrada para esta trilha." });
    const attempt = await prisma.activityAttempt.create({ data: { userId: res.locals.userId, activityKey: parsed.data.activityKey, status: "IN_PROGRESS", startedAt: new Date() }, select: { id: true, activityKey: true, status: true, startedAt: true } });
    return res.status(201).json({ attempt });
  } catch (error) { return next(error); }
});

app.post("/api/activities/:id/complete", requireSession, async (req, res, next) => {
  try {
    const parsedAttemptId = z.string().min(1).max(100).safeParse(req.params.id);
    if (!parsedAttemptId.success) return res.status(400).json({ error: "Identificador de sessão inválido." });
    const attempt = await prisma.activityAttempt.findFirst({ where: { id: parsedAttemptId.data, userId: res.locals.userId } });
    if (!attempt) return res.status(404).json({ error: "Sessão de atividade não encontrada." });
    if (attempt.status === "COMPLETED") return res.status(409).json({ error: "Esta atividade já foi concluída." });
    const completed = await prisma.activityAttempt.update({ where: { id: attempt.id }, data: { status: "COMPLETED", completedAt: new Date() }, select: { id: true, activityKey: true, status: true, startedAt: true, completedAt: true } });
    return res.json({ attempt: completed });
  } catch (error) { return next(error); }
});

app.post("/api/tutor/chat", requireSession, async (req, res, next) => {
  const parsed = z.object({
    message: z.string().trim().min(1).max(3000),
    history: z.array(z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().trim().min(1).max(3000)
    })).max(10).default([])
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Envie uma mensagem de até 3.000 caracteres e um histórico curto." });

  const apiUrl = process.env.AI_API_URL;
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL;
  if (!apiUrl || !apiKey || !model) {
    return res.status(503).json({ error: "O tutor IA ainda não está configurado neste ambiente. O administrador precisa configurar AI_API_URL, AI_API_KEY e AI_MODEL." });
  }

  let target: URL;
  try {
    target = new URL(apiUrl);
  } catch {
    return res.status(503).json({ error: "A configuração do provedor do tutor IA é inválida." });
  }
  if (target.protocol !== "https:" && !["localhost", "127.0.0.1", "::1"].includes(target.hostname)) {
    return res.status(503).json({ error: "O provedor do tutor IA precisa usar HTTPS." });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: res.locals.userId },
      select: { schoolYear: true, readingFluency: true, learningGoals: true }
    });
    if (!user) return res.status(401).json({ error: "Faça login novamente para usar o tutor." });
    const gradeLabels: Record<string, string> = {
      "6EF": "6º ano do Ensino Fundamental", "7EF": "7º ano do Ensino Fundamental",
      "8EF": "8º ano do Ensino Fundamental", "9EF": "9º ano do Ensino Fundamental",
      "1EM": "1º ano do Ensino Médio", "2EM": "2º ano do Ensino Médio", "3EM": "3º ano do Ensino Médio"
    };
    const goalLabels: Record<string, string> = {
      melhorar_estudos: "melhorar a qualidade de estudo", aprender: "aprender coisas novas",
      recuperar_conteudo: "recuperar conteúdo perdido", provas_enem: "preparar-se para provas e ENEM"
    };
    const selectedGoals = (JSON.parse(user.learningGoals) as string[]).map(goal => goalLabels[goal] ?? goal);
    const systemPrompt = [
      "Você é o tutor pedagógico do Estuda, uma plataforma brasileira para alunos do 6º ano do Ensino Fundamental ao 3º ano do Ensino Médio.",
      "Responda em português brasileiro, com linguagem acolhedora, clara e adequada à idade.",
      "Priorize ensinar o raciocínio: comece com uma pista ou pergunta orientadora quando fizer sentido, divida explicações em etapas e verifique se o aluno entendeu.",
      "Não entregue apenas a resposta final quando o aluno estiver aprendendo; explique conceitos, dê exemplos e convide o aluno a tentar o próximo passo.",
      "Se a pergunta for sobre uma tarefa escolar, ajude a aprender sem incentivar cola ou apresentar conteúdo não verificado como certeza.",
      "Não invente notas, histórico de estudo, dados pessoais ou fatos sobre o aluno. Se faltar contexto, pergunte.",
      "Série do aluno: " + (gradeLabels[user.schoolYear ?? ""] ?? "não informada") + ".",
      "Fluência de leitura informada pelo aluno: " + (user.readingFluency ?? "não informada") + ".",
      "Objetivos escolhidos: " + (selectedGoals.length ? selectedGoals.join(", ") : "não informados") + "."
    ].join("\n");

    const providerResponse = await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          ...parsed.data.history.map(item => ({ role: item.role, content: item.content })),
          { role: "user", content: parsed.data.message }
        ],
        temperature: 0.4,
        max_tokens: 800
      }),
      signal: AbortSignal.timeout(30000)
    });
    if (!providerResponse.ok) {
      return res.status(503).json({ error: "O tutor IA está temporariamente indisponível. Tente novamente mais tarde." });
    }
    const providerData = await providerResponse.json() as { choices?: Array<{ message?: { content?: unknown } }> };
    const reply = providerData.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim()) {
      return res.status(502).json({ error: "O provedor do tutor IA retornou uma resposta inválida." });
    }
    return res.json({ reply: reply.trim().slice(0, 8000) });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      return res.status(503).json({ error: "O tutor IA demorou demais para responder. Tente novamente." });
    }
    return res.status(503).json({ error: "Não foi possível conectar ao tutor IA. Tente novamente mais tarde." });
  }
});

app.post("/api/auth/register", async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Confira os campos do cadastro." });
    const userName = parsed.data.displayName;
    if (await prisma.user.findUnique({ where: { displayName: userName } })) return res.status(409).json({ error: "Este nome já está em uso. Escolha outro." });
    const recoveryCode = randomBytes(5).toString("hex").toUpperCase();
    const user = await prisma.user.create({ data: {
      displayName: userName, passwordHash: await bcrypt.hash(parsed.data.password, 12),
      recoveryCodeHash: createHash("sha256").update(recoveryCode).digest("hex"),
      schoolYear: parsed.data.schoolYear, readingFluency: parsed.data.readingFluency,
      learningGoals: JSON.stringify(parsed.data.learningGoals)
    }, select: { id: true, displayName: true, schoolYear: true, readingFluency: true, learningGoals: true } });
    issueSession(res, user.id);
    return res.status(201).json({ user: { ...user, learningGoals: JSON.parse(user.learningGoals) }, recoveryCode, notice: "Guarde seu código de recuperação em local seguro. Ele não será exibido novamente." });
  } catch (error) { return next(error); }
});

app.post("/api/auth/recover", async (req, res, next) => {
  try {
    const parsed = recoverySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Não foi possível recuperar a conta. Confira os dados e tente novamente." });
    const user = await prisma.user.findUnique({ where: { displayName: parsed.data.displayName } });
    const suppliedHash = createHash("sha256").update(parsed.data.recoveryCode.trim().toUpperCase()).digest();
    const storedHash = user ? Buffer.from(user.recoveryCodeHash, "hex") : Buffer.alloc(32);
    const matches = storedHash.length === suppliedHash.length && timingSafeEqual(storedHash, suppliedHash);
    if (!user || !matches) return res.status(400).json({ error: "Não foi possível recuperar a conta. Confira os dados e tente novamente." });

    const nextRecoveryCode = randomBytes(16).toString("hex").toUpperCase();
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await bcrypt.hash(parsed.data.newPassword, 12),
        recoveryCodeHash: createHash("sha256").update(nextRecoveryCode).digest("hex")
      },
      select: { id: true, displayName: true, schoolYear: true, readingFluency: true, learningGoals: true }
    });
    issueSession(res, updated.id);
    return res.json({
      user: { ...updated, learningGoals: JSON.parse(updated.learningGoals) },
      recoveryCode: nextRecoveryCode,
      notice: "Senha alterada. Guarde o novo código de recuperação: o código anterior deixou de funcionar."
    });
  } catch (error) { return next(error); }
});

app.post("/api/auth/login", async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Informe nome e senha válidos." });
    const user = await prisma.user.findUnique({ where: { displayName: parsed.data.displayName } });
    if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) return res.status(401).json({ error: "Nome ou senha incorretos." });
    issueSession(res, user.id);
    return res.json({ user: { id: user.id, displayName: user.displayName, schoolYear: user.schoolYear, readingFluency: user.readingFluency, learningGoals: JSON.parse(user.learningGoals) } });
  } catch (error) { return next(error); }
});

app.post("/api/auth/logout", (_req, res) => {
  res.clearCookie("estuda_session", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
  return res.status(204).end();
});

app.get("/api/me", requireSession, async (_req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: res.locals.userId }, select: {
      id: true, displayName: true, schoolYear: true, readingFluency: true, learningGoals: true,
      diagnostic: { select: { completedAt: true } }
    } });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado." });
    return res.json({ ...user, learningGoals: JSON.parse(user.learningGoals) });
  } catch (error) { return next(error); }
});

app.patch("/api/me", requireSession, async (req, res, next) => {
  try {
    const parsed = profileSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Confira nome, série, leitura e ao menos um objetivo." });
    const userId = res.locals.userId as string;
    const duplicate = await prisma.user.findFirst({
      where: { displayName: parsed.data.displayName, NOT: { id: userId } },
      select: { id: true }
    });
    if (duplicate) return res.status(409).json({ error: "Este nome já está em uso. Escolha outro." });
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        displayName: parsed.data.displayName,
        schoolYear: parsed.data.schoolYear,
        readingFluency: parsed.data.readingFluency,
        learningGoals: JSON.stringify(parsed.data.learningGoals)
      },
      select: { id: true, displayName: true, schoolYear: true, readingFluency: true, learningGoals: true }
    });
    return res.json({ user: { ...updated, learningGoals: JSON.parse(updated.learningGoals) } });
  } catch (error) { return next(error); }
});

app.get("/api/diagnostic", requireSession, async (_req, res, next) => {
  try {
    const diagnostic = await prisma.diagnostic.findUnique({
      where: { userId: res.locals.userId },
      select: { answers: true, completedAt: true }
    });
    if (!diagnostic) return res.json({ answers: {}, completedAt: null });
    return res.json({ answers: JSON.parse(diagnostic.answers), completedAt: diagnostic.completedAt });
  } catch (error) { return next(error); }
});

app.put("/api/diagnostic", requireSession, async (req, res, next) => {
  try {
    const parsed = diagnosticSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Respostas de diagnóstico inválidas." });
    const saved = await prisma.diagnostic.upsert({
      where: { userId: res.locals.userId },
      create: { userId: res.locals.userId, answers: JSON.stringify(parsed.data.answers) },
      update: { answers: JSON.stringify(parsed.data.answers), completedAt: new Date() }
    });
    return res.json({ completedAt: saved.completedAt });
  } catch (error) { return next(error); }
});

app.get("/api/dashboard", requireSession, async (_req, res, next) => {
  try {
    const userId = res.locals.userId as string;
    const [activities, allAttempts, completedCount, diagnostic] = await Promise.all([
      prisma.activityAttempt.findMany({ where: { userId }, orderBy: { updatedAt: "desc" }, take: 50, select: { id: true, activityKey: true, status: true, score: true, startedAt: true, completedAt: true } }),
      prisma.activityAttempt.findMany({ where: { userId }, select: { startedAt: true, completedAt: true } }),
      prisma.activityAttempt.count({ where: { userId, status: "COMPLETED" } }),
      prisma.diagnostic.findUnique({ where: { userId }, select: { completedAt: true } })
    ]);
    const durationMs = allAttempts.reduce((sum, a) => sum + (a.startedAt && a.completedAt ? Math.max(0, a.completedAt.getTime() - a.startedAt.getTime()) : 0), 0);
    return res.json({ activities, stats: { completedCount, totalStudyMinutes: Math.floor(durationMs / 60000) }, diagnosticCompletedAt: diagnostic?.completedAt ?? null, hasActivity: activities.length > 0 });
  } catch (error) { return next(error); }
});

if (process.env.NODE_ENV === "production") {
  const clientDist = path.resolve(process.cwd(), "dist");
  app.use(express.static(clientDist, { index: false, maxAge: "1h" }));
  app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/api/") && req.accepts("html")) {
      return res.sendFile(path.join(clientDist, "index.html"));
    }
    return next();
  });
}

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("API error:", error instanceof Error ? error.message : "unknown");
  return res.status(500).json({ error: "Ocorreu um erro interno. Tente novamente." });
});
if (process.env.NODE_ENV !== "test") app.listen(port, () => console.log("Estuda API disponível na porta " + port));
export { app, prisma };