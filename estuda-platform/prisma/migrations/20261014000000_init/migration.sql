-- Initial PostgreSQL schema for Estuda.
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "recoveryCodeHash" TEXT NOT NULL,
    "schoolYear" TEXT,
    "readingFluency" TEXT,
    "learningGoals" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Diagnostic" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "answers" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Diagnostic_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ActivityAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activityKey" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "score" DOUBLE PRECISION,
    "answers" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ActivityAttempt_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_displayName_key" ON "User"("displayName");
CREATE UNIQUE INDEX "User_recoveryCodeHash_key" ON "User"("recoveryCodeHash");
CREATE UNIQUE INDEX "Diagnostic_userId_key" ON "Diagnostic"("userId");
CREATE INDEX "ActivityAttempt_userId_status_idx" ON "ActivityAttempt"("userId", "status");
CREATE INDEX "ActivityAttempt_userId_completedAt_idx" ON "ActivityAttempt"("userId", "completedAt");

ALTER TABLE "Diagnostic" ADD CONSTRAINT "Diagnostic_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ActivityAttempt" ADD CONSTRAINT "ActivityAttempt_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
