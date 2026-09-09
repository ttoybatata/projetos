import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  achievements,
  diagnosticAttempts,
  InsertUser,
  learningProgress,
  quizAttempts,
  studentProfiles,
  studyPlanItems,
  studyPlans,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db
    .insert(users)
    .values(values)
    .onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);
  return result[0];
}

export async function getStudentState(userId: number) {
  const db = await getDb();
  if (!db)
    return {
      profile: undefined,
      progress: [],
      attempts: [],
      achievements: [],
      plan: undefined,
      planItems: [],
    };
  const [profileRows, progress, attempts, unlocked, planRows] =
    await Promise.all([
      db
        .select()
        .from(studentProfiles)
        .where(eq(studentProfiles.userId, userId))
        .limit(1),
      db
        .select()
        .from(learningProgress)
        .where(eq(learningProgress.userId, userId)),
      db
        .select()
        .from(quizAttempts)
        .where(eq(quizAttempts.userId, userId))
        .orderBy(desc(quizAttempts.completedAt))
        .limit(50),
      db
        .select()
        .from(achievements)
        .where(eq(achievements.userId, userId))
        .orderBy(desc(achievements.unlockedAt)),
      db
        .select()
        .from(studyPlans)
        .where(eq(studyPlans.userId, userId))
        .limit(1),
    ]);
  const plan = planRows[0];
  const planItems = plan
    ? await db
        .select()
        .from(studyPlanItems)
        .where(eq(studyPlanItems.planId, plan.id))
        .orderBy(studyPlanItems.dayOrder)
    : [];
  return {
    profile: profileRows[0],
    progress,
    attempts,
    achievements: unlocked,
    plan,
    planItems,
  };
}

function buildPlan(data: {
  grade?: string;
  goal?: string;
  subjectScores: Record<string, number>;
  weakTopics: string[];
}) {
  const ranked = Object.entries(data.subjectScores).sort(
    ([, a], [, b]) => a - b
  );
  const weakest = ranked[0]?.[0] || "Matemática";
  const second = ranked[1]?.[0] || "Linguagens";
  const topic = data.weakTopics[0] || `Fundamentos de ${weakest}`;
  const goalText = data.goal || "avançar com mais segurança";
  const items = [
    {
      dayOrder: 1,
      subject: weakest,
      title: `Aula guiada: ${topic}`,
      activityKind: "aula" as const,
      durationMinutes: 25,
      rationale: `Reforçar a principal lacuna encontrada no diagnóstico para ${goalText}.`,
    },
    {
      dayOrder: 2,
      subject: weakest,
      title: `Quiz de prática: ${topic}`,
      activityKind: "quiz" as const,
      durationMinutes: 15,
      rationale: "Verificar se o conceito foi compreendido após a aula.",
    },
    {
      dayOrder: 3,
      subject: second,
      title: `Revisão essencial de ${second}`,
      activityKind: "aula" as const,
      durationMinutes: 20,
      rationale: "Manter uma segunda frente ativa sem sobrecarregar a semana.",
    },
    {
      dayOrder: 4,
      subject: weakest,
      title: `Quiz de recuperação: ${topic}`,
      activityKind: "quiz" as const,
      durationMinutes: 15,
      rationale: "Retomar os erros com nova tentativa e feedback imediato.",
    },
    {
      dayOrder: 5,
      subject: "Múltiplas áreas",
      title: "Simulado curto da semana",
      activityKind: "simulado" as const,
      durationMinutes: 30,
      rationale:
        "Conectar os conteúdos e produzir novas evidências para o próximo plano.",
    },
  ];
  return {
    title: `Plano de 5 dias para ${data.grade || "seu momento atual"}`,
    summary: `Prioridade em ${weakest}, com revisão complementar de ${second}. O plano começa por ${topic} e alterna explicação, prática e verificação.`,
    weeklyMinutes: items.reduce((sum, item) => sum + item.durationMinutes, 0),
    items,
  };
}

export async function completeDiagnostic(
  userId: number,
  data: {
    name: string;
    email: string;
    grade: string;
    goal: string;
    score: number;
    total: number;
    subjectScores: Record<string, number>;
    weakTopics: string[];
    answers: Array<{ subject: string; correct: boolean; topic: string }>;
  }
) {
  const db = await getDb();
  if (!db) return undefined;
  const profileValues = {
    userId,
    name: data.name.trim(),
    email: data.email.trim(),
    grade: data.grade || null,
    goal: data.goal || null,
    diagnosticCompletedAt: new Date(),
  };
  await db
    .insert(studentProfiles)
    .values(profileValues)
    .onDuplicateKeyUpdate({
      set: {
        name: profileValues.name,
        email: profileValues.email,
        grade: profileValues.grade,
        goal: profileValues.goal,
        diagnosticCompletedAt: profileValues.diagnosticCompletedAt,
      },
    });
  await db
    .insert(diagnosticAttempts)
    .values({
      userId,
      score: data.score,
      total: data.total,
      subjectScores: JSON.stringify(data.subjectScores),
      weakTopics: data.weakTopics.join("|"),
      answers: JSON.stringify(data.answers),
    });
  await upsertProgress(userId, "diagnostico", 100, db);
  const plan = buildPlan(data);
  const existingPlan = await db
    .select()
    .from(studyPlans)
    .where(eq(studyPlans.userId, userId))
    .limit(1);
  let planId = existingPlan[0]?.id;
  if (planId) {
    await db.delete(studyPlanItems).where(eq(studyPlanItems.planId, planId));
    await db
      .update(studyPlans)
      .set({
        title: plan.title,
        summary: plan.summary,
        weeklyMinutes: plan.weeklyMinutes,
        generatedAt: new Date(),
      })
      .where(eq(studyPlans.id, planId));
  } else {
    const inserted = await db
      .insert(studyPlans)
      .values({
        userId,
        title: plan.title,
        summary: plan.summary,
        weeklyMinutes: plan.weeklyMinutes,
      })
      .$returningId();
    planId = inserted[0]?.id;
  }
  if (planId)
    await db
      .insert(studyPlanItems)
      .values(plan.items.map(item => ({ ...item, planId: planId as number })));
  return getStudentState(userId);
}

export async function saveStudentProfile(
  userId: number,
  data: {
    name: string;
    email: string;
    grade?: string;
    goal?: string;
    diagnosticCompleted?: boolean;
  }
) {
  const db = await getDb();
  if (!db) return undefined;
  const values = {
    userId,
    name: data.name.trim(),
    email: data.email.trim(),
    grade: data.grade || null,
    goal: data.goal || null,
    ...(data.diagnosticCompleted ? { diagnosticCompletedAt: new Date() } : {}),
  };
  const updateSet = {
    name: values.name,
    email: values.email,
    grade: values.grade,
    goal: values.goal,
    ...(data.diagnosticCompleted
      ? { diagnosticCompletedAt: values.diagnosticCompletedAt }
      : {}),
  };
  await db
    .insert(studentProfiles)
    .values(values)
    .onDuplicateKeyUpdate({ set: updateSet });
  if (data.diagnosticCompleted)
    await upsertProgress(userId, "diagnostico", 100, db);
  return (await getStudentState(userId)).profile;
}

async function upsertProgress(
  userId: number,
  activityKind: "diagnostico" | "aula" | "quiz" | "simulado",
  percent: number,
  db: NonNullable<Awaited<ReturnType<typeof getDb>>>
) {
  const existing = await db
    .select()
    .from(learningProgress)
    .where(
      and(
        eq(learningProgress.userId, userId),
        eq(learningProgress.activityKind, activityKind)
      )
    )
    .limit(1);
  const completedCount = (existing[0]?.completedCount ?? 0) + 1;
  await db
    .insert(learningProgress)
    .values({ userId, activityKind, percent, completedCount })
    .onDuplicateKeyUpdate({ set: { percent, completedCount } });
}

export async function recordLearningActivity(
  userId: number,
  data: {
    activityKind: "aula" | "quiz" | "simulado";
    subject: string;
    score?: number;
    total?: number;
    feedback?: string;
    weakTopics?: string;
  }
) {
  const db = await getDb();
  if (!db) return undefined;
  const profile = (
    await db
      .select()
      .from(studentProfiles)
      .where(eq(studentProfiles.userId, userId))
      .limit(1)
  )[0];
  if (!profile?.diagnosticCompletedAt)
    throw new Error("Complete o diagnóstico antes de registrar atividades");
  const score = data.score ?? 0;
  const total = data.total ?? 1;
  await upsertProgress(userId, data.activityKind, 100, db);
  if (data.activityKind === "quiz" || data.activityKind === "simulado") {
    await db
      .insert(quizAttempts)
      .values({
        userId,
        activityKind: data.activityKind,
        subject: data.subject,
        score,
        total,
        feedback: data.feedback || null,
        weakTopics: data.weakTopics || null,
      });
    const attempts = await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.userId, userId));
    const unlock = async (slug: string, title: string, description: string) => {
      await db
        .insert(achievements)
        .values({ userId, slug, title, description })
        .onDuplicateKeyUpdate({ set: { title, description } });
    };
    if (attempts.length >= 1)
      await unlock(
        "primeiro-quiz",
        "Primeira tentativa",
        "Você concluiu seu primeiro quiz na Trilha."
      );
    if (attempts.length >= 3)
      await unlock(
        "ritmo-de-estudo",
        "Ritmo de estudo",
        "Você concluiu três atividades avaliativas."
      );
    if (total > 0 && score === total)
      await unlock(
        "dominio-total",
        "Domínio total",
        "Você acertou todas as questões desta tentativa."
      );
  }
  return getStudentState(userId);
}
