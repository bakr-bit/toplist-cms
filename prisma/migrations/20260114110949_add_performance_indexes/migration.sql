-- CreateIndex
CREATE INDEX "Toplist_siteKey_idx" ON "Toplist"("siteKey");

-- CreateIndex
CREATE INDEX "ToplistItem_toplistId_idx" ON "ToplistItem"("toplistId");

-- CreateIndex
CREATE INDEX "ToplistItem_brandId_idx" ON "ToplistItem"("brandId");
