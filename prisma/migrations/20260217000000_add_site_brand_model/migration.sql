-- CreateTable
CREATE TABLE "SiteBrand" (
    "siteKey" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "logo" TEXT,
    "bonus" TEXT,
    "affiliateUrl" TEXT,
    "rating" DECIMAL(3,1),
    "terms" TEXT,
    "description" TEXT,
    "pros" JSONB,
    "cons" JSONB,
    "welcomePackage" TEXT,
    "noDepositBonus" TEXT,
    "freeSpinsOffer" TEXT,
    "wageringRequirement" TEXT,
    "loyaltyProgram" TEXT,
    "promotions" TEXT,
    "features" JSONB,
    "badgeText" TEXT,
    "badgeColor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteBrand_pkey" PRIMARY KEY ("siteKey","brandId")
);

-- CreateIndex
CREATE INDEX "SiteBrand_siteKey_idx" ON "SiteBrand"("siteKey");

-- CreateIndex
CREATE INDEX "SiteBrand_brandId_idx" ON "SiteBrand"("brandId");

-- AddForeignKey
ALTER TABLE "SiteBrand" ADD CONSTRAINT "SiteBrand_siteKey_fkey" FOREIGN KEY ("siteKey") REFERENCES "Site"("siteKey") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteBrand" ADD CONSTRAINT "SiteBrand_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("brandId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Migrate data: Create SiteBrand records from ToplistItem overrides + Brand defaults
-- For each brand that appears in any toplist, create a SiteBrand with the override data
INSERT INTO "SiteBrand" ("siteKey", "brandId", "bonus", "affiliateUrl", "rating", "terms", "description",
    "pros", "cons", "logo", "welcomePackage", "noDepositBonus", "freeSpinsOffer",
    "wageringRequirement", "loyaltyProgram", "promotions", "features", "badgeText", "badgeColor",
    "createdAt", "updatedAt")
SELECT DISTINCT ON (t."siteKey", ti."brandId")
    t."siteKey",
    ti."brandId",
    COALESCE(ti."bonus", b."defaultBonus"),
    COALESCE(ti."affiliateUrl", b."defaultAffiliateUrl"),
    COALESCE(ti."rating", b."defaultRating"),
    COALESCE(ti."termsOverride", b."terms"),
    b."description",
    COALESCE(ti."prosOverride", b."pros"),
    COALESCE(ti."consOverride", b."cons"),
    ti."logoOverride",
    b."welcomePackage",
    b."noDepositBonus",
    b."freeSpinsOffer",
    b."wageringRequirement",
    b."loyaltyProgram",
    b."promotions",
    b."features",
    b."badgeText",
    b."badgeColor",
    NOW(),
    NOW()
FROM "ToplistItem" ti
JOIN "Toplist" t ON ti."toplistId" = t."id"
JOIN "Brand" b ON ti."brandId" = b."brandId"
ORDER BY t."siteKey", ti."brandId", ti."position" ASC;

-- Drop override columns from ToplistItem
ALTER TABLE "ToplistItem" DROP COLUMN IF EXISTS "bonus";
ALTER TABLE "ToplistItem" DROP COLUMN IF EXISTS "affiliateUrl";
ALTER TABLE "ToplistItem" DROP COLUMN IF EXISTS "rating";
ALTER TABLE "ToplistItem" DROP COLUMN IF EXISTS "logoOverride";
ALTER TABLE "ToplistItem" DROP COLUMN IF EXISTS "termsOverride";
ALTER TABLE "ToplistItem" DROP COLUMN IF EXISTS "licenseOverride";
ALTER TABLE "ToplistItem" DROP COLUMN IF EXISTS "prosOverride";
ALTER TABLE "ToplistItem" DROP COLUMN IF EXISTS "consOverride";
ALTER TABLE "ToplistItem" DROP COLUMN IF EXISTS "paymentMethodsOverride";

-- Drop deal fields from Brand
ALTER TABLE "Brand" DROP COLUMN IF EXISTS "defaultBonus";
ALTER TABLE "Brand" DROP COLUMN IF EXISTS "defaultAffiliateUrl";
ALTER TABLE "Brand" DROP COLUMN IF EXISTS "defaultRating";
ALTER TABLE "Brand" DROP COLUMN IF EXISTS "terms";
ALTER TABLE "Brand" DROP COLUMN IF EXISTS "description";
ALTER TABLE "Brand" DROP COLUMN IF EXISTS "pros";
ALTER TABLE "Brand" DROP COLUMN IF EXISTS "cons";
ALTER TABLE "Brand" DROP COLUMN IF EXISTS "welcomePackage";
ALTER TABLE "Brand" DROP COLUMN IF EXISTS "noDepositBonus";
ALTER TABLE "Brand" DROP COLUMN IF EXISTS "freeSpinsOffer";
ALTER TABLE "Brand" DROP COLUMN IF EXISTS "wageringRequirement";
ALTER TABLE "Brand" DROP COLUMN IF EXISTS "loyaltyProgram";
ALTER TABLE "Brand" DROP COLUMN IF EXISTS "promotions";
ALTER TABLE "Brand" DROP COLUMN IF EXISTS "features";
ALTER TABLE "Brand" DROP COLUMN IF EXISTS "badgeText";
ALTER TABLE "Brand" DROP COLUMN IF EXISTS "badgeColor";
