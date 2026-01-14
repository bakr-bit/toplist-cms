-- AlterTable
ALTER TABLE "Brand" ADD COLUMN     "cons" JSONB,
ADD COLUMN     "defaultAffiliateUrl" TEXT,
ADD COLUMN     "defaultBonus" TEXT,
ADD COLUMN     "license" TEXT,
ADD COLUMN     "pros" JSONB,
ADD COLUMN     "terms" TEXT;

-- AlterTable
ALTER TABLE "ToplistItem" ADD COLUMN     "consOverride" JSONB,
ADD COLUMN     "licenseOverride" TEXT,
ADD COLUMN     "prosOverride" JSONB,
ADD COLUMN     "termsOverride" TEXT;
