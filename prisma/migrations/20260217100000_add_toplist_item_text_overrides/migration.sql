-- AlterTable: Add per-toplist text override fields to ToplistItem
ALTER TABLE "ToplistItem" ADD COLUMN "bonus" TEXT;
ALTER TABLE "ToplistItem" ADD COLUMN "description" TEXT;
ALTER TABLE "ToplistItem" ADD COLUMN "terms" TEXT;
ALTER TABLE "ToplistItem" ADD COLUMN "badgeText" TEXT;
ALTER TABLE "ToplistItem" ADD COLUMN "badgeColor" TEXT;
