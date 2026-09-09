import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const studentProfiles = mysqlTable(
  "student_profiles",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().unique(),
    name: varchar("name", { length: 160 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    grade: varchar("grade", { length: 120 }),
    goal: varchar("goal", { length: 160 }),
    diagnosticCompletedAt: timestamp("diagnosticCompletedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    userIdIdx: uniqueIndex("student_profiles_user_id_idx").on(table.userId),
  })
);

export const diagnosticAttempts = mysqlTable("diagnostic_attempts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  score: int("score").notNull(),
  total: int("total").notNull(),
  subjectScores: text("subjectScores").notNull(),
  weakTopics: text("weakTopics"),
  answers: text("answers").notNull(),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
});

export const studyPlans = mysqlTable(
  "study_plans",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().unique(),
    title: varchar("title", { length: 180 }).notNull(),
    summary: text("summary").notNull(),
    weeklyMinutes: int("weeklyMinutes").notNull(),
    generatedAt: timestamp("generatedAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    userPlanIdx: uniqueIndex("study_plans_user_id_idx").on(table.userId),
  })
);

export const studyPlanItems = mysqlTable("study_plan_items", {
  id: int("id").autoincrement().primaryKey(),
  planId: int("planId").notNull(),
  dayOrder: int("dayOrder").notNull(),
  subject: varchar("subject", { length: 120 }).notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  activityKind: mysqlEnum("activityKind", [
    "aula",
    "quiz",
    "simulado",
  ]).notNull(),
  durationMinutes: int("durationMinutes").notNull(),
  rationale: text("rationale").notNull(),
  completed: int("completed").default(0).notNull(),
});

export const learningProgress = mysqlTable(
  "learning_progress",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    activityKind: mysqlEnum("activityKind", [
      "diagnostico",
      "aula",
      "quiz",
      "simulado",
    ]).notNull(),
    percent: int("percent").default(0).notNull(),
    completedCount: int("completedCount").default(0).notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    userKindIdx: uniqueIndex("learning_progress_user_kind_idx").on(
      table.userId,
      table.activityKind
    ),
  })
);

export const quizAttempts = mysqlTable("quiz_attempts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  activityKind: mysqlEnum("activityKind", ["quiz", "simulado"]).notNull(),
  subject: varchar("subject", { length: 160 }).notNull(),
  score: int("score").notNull(),
  total: int("total").notNull(),
  feedback: text("feedback"),
  weakTopics: text("weakTopics"),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
});

export const achievements = mysqlTable(
  "achievements",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    slug: varchar("slug", { length: 80 }).notNull(),
    title: varchar("title", { length: 140 }).notNull(),
    description: text("description").notNull(),
    unlockedAt: timestamp("unlockedAt").defaultNow().notNull(),
  },
  table => ({
    userAchievementIdx: uniqueIndex("achievements_user_slug_idx").on(
      table.userId,
      table.slug
    ),
  })
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type StudentProfile = typeof studentProfiles.$inferSelect;
export type DiagnosticAttempt = typeof diagnosticAttempts.$inferSelect;
export type StudyPlan = typeof studyPlans.$inferSelect;
export type StudyPlanItem = typeof studyPlanItems.$inferSelect;
export type LearningProgress = typeof learningProgress.$inferSelect;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
