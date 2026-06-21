-- CreateTable
CREATE TABLE "Standup" (
    "id" SERIAL NOT NULL,
    "user" TEXT NOT NULL,
    "update" TEXT NOT NULL,
    "blockers" TEXT,
    "date" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Standup_pkey" PRIMARY KEY ("id")
);
