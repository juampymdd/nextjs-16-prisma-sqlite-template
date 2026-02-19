/*
  Warnings:

  - Made the column `projectId` on table `task` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateTable
CREATE TABLE "attachment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "attachment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "task" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "dueDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    CONSTRAINT "task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_task" ("completed", "completedAt", "createdAt", "description", "dueDate", "id", "priority", "projectId", "status", "title", "userId") SELECT "completed", "completedAt", "createdAt", "description", "dueDate", "id", "priority", "projectId", "status", "title", "userId" FROM "task";
DROP TABLE "task";
ALTER TABLE "new_task" RENAME TO "task";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
