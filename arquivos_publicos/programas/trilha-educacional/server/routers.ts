import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  completeDiagnostic,
  getStudentState,
  recordLearningActivity,
  saveStudentProfile,
} from "./db";
import {
  achievements,
  diagnosticAttempts,
  learningProgress,
  quizAttempts,
  studentProfiles,
  studyPlanItems,
  studyPlans,
  users,
} from "../drizzle/schema";
import { getDb } from "./db";
import { eq } from "drizzle-orm";

const profileInput = z.object({
  name: z.string().trim().min(2).max(160),
  email: z.string().email().max(320),
  grade: z.string().trim().max(120).optional(),
  goal: z.string().trim().max(160).optional(),
  diagnosticCompleted: z.boolean().optional(),
});
const diagnosticInput = z.object({
  name: z.string().trim().min(2).max(160),
  email: z.string().email().max(320),
  grade: z.string().trim().min(1).max(120),
  goal: z.string().trim().min(1).max(160),
  score: z.number().int().min(0),
  total: z.number().int().min(1),
  subjectScores: z.record(z.string(), z.number().int().min(0).max(100)),
  weakTopics: z.array(z.string().max(180)).max(20),
  answers: z
    .array(
      z.object({
        subject: z.string().max(120),
        correct: z.boolean(),
        topic: z.string().max(180),
      })
    )
    .max(30),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  student: router({
    state: protectedProcedure.query(({ ctx }) => getStudentState(ctx.user.id)),
    saveProfile: protectedProcedure
      .input(profileInput)
      .mutation(({ ctx, input }) => saveStudentProfile(ctx.user.id, input)),
    completeDiagnostic: protectedProcedure
      .input(diagnosticInput)
      .mutation(({ ctx, input }) => completeDiagnostic(ctx.user.id, input)),
    recordActivity: protectedProcedure
      .input(
        z.object({
          activityKind: z.enum(["aula", "quiz", "simulado"]),
          subject: z.string().trim().min(2).max(160),
          score: z.number().int().min(0).optional(),
          total: z.number().int().min(1).optional(),
          feedback: z.string().max(4000).optional(),
          weakTopics: z.string().max(2000).optional(),
        })
      )
      .mutation(({ ctx, input }) => recordLearningActivity(ctx.user.id, input)),
    deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return { success: false } as const;
      const userId = ctx.user.id;
      const plans = await db
        .select()
        .from(studyPlans)
        .where(eq(studyPlans.userId, userId));
      for (const plan of plans)
        await db
          .delete(studyPlanItems)
          .where(eq(studyPlanItems.planId, plan.id));
      await db.delete(studyPlans).where(eq(studyPlans.userId, userId));
      await db
        .delete(diagnosticAttempts)
        .where(eq(diagnosticAttempts.userId, userId));
      await db.delete(quizAttempts).where(eq(quizAttempts.userId, userId));
      await db.delete(achievements).where(eq(achievements.userId, userId));
      await db
        .delete(learningProgress)
        .where(eq(learningProgress.userId, userId));
      await db
        .delete(studentProfiles)
        .where(eq(studentProfiles.userId, userId));
      await db.delete(users).where(eq(users.id, userId));
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
});

export type AppRouter = typeof appRouter;
