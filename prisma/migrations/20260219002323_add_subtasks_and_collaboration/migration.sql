-- CreateTable
CREATE TABLE "subtask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "taskId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "subtask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "task" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "task_collaborator" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "task_collaborator_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "task" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "task_collaborator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "task_collaborator_taskId_userId_key" ON "task_collaborator"("taskId", "userId");
