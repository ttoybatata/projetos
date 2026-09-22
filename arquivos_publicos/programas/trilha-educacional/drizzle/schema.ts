import {
  pgTable,
  pgEnum,
  integer,
  serial,
  text,
  timestamp,
  varchar,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// Em Postgres, enum é um tipo nomeado no banco (não inline como no MySQL).
// Por isso viram 4 tipos distintos, um por conjunto de valores original,
// preservando a mesma validação que cada mysqlEnum tinha por coluna.
export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const planItemActivityKindEnum = pgEnum("plan_item_activity_kind", [
  "aula",
  "quiz",
  "simulado",
]);
export const progressActivityKindEnum = pgEnum("progress_activity_kind", [
  "diagnostico",
  "aula",
  "quiz",
  "simulado",
]);
export const attemptActivityKindEnum = pgEnum("attempt_activity_kind", [
  "quiz",
  "simulado",
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),