/*
  Warnings:

  - You are about to drop the column `actionId` on the `PlaybookApproval` table. All the data in the column will be lost.
  - You are about to drop the column `actionType` on the `PlaybookApproval` table. All the data in the column will be lost.
  - You are about to drop the column `comments` on the `PlaybookApproval` table. All the data in the column will be lost.
  - You are about to drop the column `decidedAt` on the `PlaybookApproval` table. All the data in the column will be lost.
  - You are about to drop the column `decidedBy` on the `PlaybookApproval` table. All the data in the column will be lost.
  - You are about to drop the column `executionId` on the `PlaybookApproval` table. All the data in the column will be lost.
  - You are about to drop the column `parameters` on the `PlaybookApproval` table. All the data in the column will be lost.
  - Added the required column `alertId` to the `PlaybookApproval` table without a default value. This is not possible if the table is not empty.
  - Added the required column `playbookId` to the `PlaybookApproval` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PlaybookApproval" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playbookId" TEXT NOT NULL,
    "alertId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestedBy" TEXT NOT NULL DEFAULT 'system',
    "approvedAt" DATETIME,
    "approvedBy" TEXT,
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PlaybookApproval_playbookId_fkey" FOREIGN KEY ("playbookId") REFERENCES "Playbook" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PlaybookApproval_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "Alert" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PlaybookApproval" ("createdAt", "id", "reason", "requestedAt", "requestedBy", "status", "updatedAt") SELECT "createdAt", "id", "reason", "requestedAt", "requestedBy", "status", "updatedAt" FROM "PlaybookApproval";
DROP TABLE "PlaybookApproval";
ALTER TABLE "new_PlaybookApproval" RENAME TO "PlaybookApproval";
CREATE INDEX "PlaybookApproval_playbookId_idx" ON "PlaybookApproval"("playbookId");
CREATE INDEX "PlaybookApproval_alertId_idx" ON "PlaybookApproval"("alertId");
CREATE INDEX "PlaybookApproval_status_idx" ON "PlaybookApproval"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
