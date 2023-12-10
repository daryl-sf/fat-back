/*
  Warnings:

  - Added the required column `leagueId` to the `WeekPick` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WeekPick" ADD COLUMN     "leagueId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "WeekPick" ADD CONSTRAINT "WeekPick_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE CASCADE ON UPDATE CASCADE;
