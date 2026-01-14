-- CreateTable
CREATE TABLE "Brand" (
    "brandId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "defaultLogo" TEXT,
    "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("brandId")
);

-- CreateTable
CREATE TABLE "Site" (
    "siteKey" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Site_pkey" PRIMARY KEY ("siteKey")
);

-- CreateTable
CREATE TABLE "Toplist" (
    "id" TEXT NOT NULL,
    "siteKey" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Toplist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ToplistItem" (
    "id" TEXT NOT NULL,
    "toplistId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "bonus" TEXT,
    "affiliateUrl" TEXT,
    "reviewUrl" TEXT,
    "rating" DECIMAL(3,1),
    "cta" TEXT,
    "logoOverride" TEXT,

    CONSTRAINT "ToplistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Site_domain_key" ON "Site"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "Toplist_siteKey_slug_key" ON "Toplist"("siteKey", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "ToplistItem_toplistId_position_key" ON "ToplistItem"("toplistId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Toplist" ADD CONSTRAINT "Toplist_siteKey_fkey" FOREIGN KEY ("siteKey") REFERENCES "Site"("siteKey") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToplistItem" ADD CONSTRAINT "ToplistItem_toplistId_fkey" FOREIGN KEY ("toplistId") REFERENCES "Toplist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToplistItem" ADD CONSTRAINT "ToplistItem_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("brandId") ON DELETE RESTRICT ON UPDATE CASCADE;
