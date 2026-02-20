-- AlterTable
ALTER TABLE "task" ADD COLUMN     "columnId" TEXT;

-- CreateTable
CREATE TABLE "project_column" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_column_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "project_column" ADD CONSTRAINT "project_column_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "project_column"("id") ON DELETE SET NULL ON UPDATE CASCADE;
