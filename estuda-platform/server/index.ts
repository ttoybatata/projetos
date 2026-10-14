import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomBytes, createHash, timingSafeEqual } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { curriculum, schoolYears } from "../shared/curriculum.js";

const app = express();
const prisma = new PrismaClient();
const port = Number(process.env.PORT ?? 3000);
const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:5173";
if (process.env.NODE_ENV === "production" && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) {
  throw new Error("JWT_SECRET precisa ter pelo menos 32 caracteres em produção.");
}
const secret = process.env.JWT_SECRET ?? "dev-only-secret-change-this-before-production-123";
app.use(helmet());
app.use(cors({ origin: webOrigin, credentials: true }));
app.use(express.json({ limit: "32kb" }));
app.use(cookieParser());
app.use("/api/auth", rateLimit({ windowMs: 900000, limit: 30, standardHeaders: true, legacyHeaders: false }));

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
    }, select: { id: true, displayName: true, schoolYear: true } });
    issueSession(res, user.id);
    return res.status(201).json({ user, recoveryCode, notice: "Guarde seu código de recuperação em local seguro. Ele não será exibido novamente." });
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
      select: { id: true, displayName: true, schoolYear: true }
    });
    issueSession(res, updated.id);
    return res.json({
      user: updated,
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
    return res.json({ user: { id: user.id, displayName: user.displayName, schoolYear: user.schoolYear } });
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

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("API error:", error instanceof Error ? error.message : "unknown");
  return res.status(500).json({ error: "Ocorreu um erro interno. Tente novamente." });
});
if (process.env.NODE_ENV !== "test") app.listen(port, () => console.log("Estuda API disponível na porta " + port));
export { app, prisma };