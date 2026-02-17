import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions, isValidApiKey } from "@/lib/auth";
import { updateToplistItemsSchema } from "@/lib/validations";

// GET /api/sites/[siteKey]/toplists/[slug]/items - Get raw item data for editor (protected)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteKey: string; slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session && !isValidApiKey(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siteKey, slug } = await params;

    const toplist = await prisma.toplist.findUnique({
      where: {
        siteKey_slug: { siteKey, slug },
      },
      include: {
        items: {
          include: {
            brand: true,
          },
          orderBy: {
            position: "asc",
          },
        },
      },
    });

    if (!toplist) {
      return NextResponse.json(
        { error: "Toplist not found" },
        { status: 404 }
      );
    }

    // Fetch SiteBrands for display alongside items
    const brandIds = toplist.items.map((item) => item.brandId);
    const siteBrands = await prisma.siteBrand.findMany({
      where: {
        siteKey: toplist.siteKey,
        brandId: { in: brandIds },
      },
    });
    const siteBrandMap = new Map(
      siteBrands.map((sb) => [sb.brandId, sb])
    );

    // Return simplified item data + SiteBrand info for display
    const items = toplist.items.map((item) => {
      const sb = siteBrandMap.get(item.brandId);
      return {
        brandId: item.brandId,
        brandName: item.brand.name,
        brandLogo: sb?.logo || item.brand.defaultLogo,
        cta: item.cta,
        reviewUrl: item.reviewUrl,
        // SiteBrand data for display (read-only in toplist context)
        bonus: sb?.bonus || null,
        affiliateUrl: sb?.affiliateUrl || null,
        rating: sb?.rating ? Number(sb.rating) : null,
        terms: sb?.terms || null,
        description: sb?.description || null,
        pros: sb?.pros || null,
        cons: sb?.cons || null,
        features: sb?.features || null,
        badgeText: sb?.badgeText || null,
        badgeColor: sb?.badgeColor || null,
        freeSpinsOffer: sb?.freeSpinsOffer || null,
        wageringRequirement: sb?.wageringRequirement || null,
        welcomePackage: sb?.welcomePackage || null,
        loyaltyProgram: sb?.loyaltyProgram || null,
        promotions: sb?.promotions || null,
      };
    });

    return NextResponse.json({
      siteKey: toplist.siteKey,
      slug: toplist.slug,
      title: toplist.title,
      columns: toplist.columns,
      columnLabels: toplist.columnLabels,
      updatedAt: toplist.updatedAt.toISOString(),
      items,
    });
  } catch (error) {
    console.error("Error fetching toplist items:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/sites/[siteKey]/toplists/[slug]/items - Replace all items (protected)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ siteKey: string; slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session && !isValidApiKey(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siteKey, slug } = await params;
    const body = await request.json();

    const validation = updateToplistItemsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    // Get the toplist
    const toplist = await prisma.toplist.findUnique({
      where: {
        siteKey_slug: { siteKey, slug },
      },
    });

    if (!toplist) {
      return NextResponse.json(
        { error: "Toplist not found" },
        { status: 404 }
      );
    }

    // Verify all brands exist
    const brandIds = validation.data.items.map((item) => item.brandId);
    const existingBrands = await prisma.brand.findMany({
      where: { brandId: { in: brandIds } },
      select: { brandId: true },
    });

    const existingBrandIds = new Set(existingBrands.map((b) => b.brandId));
    const missingBrands = brandIds.filter((id) => !existingBrandIds.has(id));

    if (missingBrands.length > 0) {
      return NextResponse.json(
        { error: "Brands not found", missingBrands },
        { status: 400 }
      );
    }

    // Transaction: delete all existing items and create new ones
    await prisma.$transaction(async (tx) => {
      // Delete existing items
      await tx.toplistItem.deleteMany({
        where: { toplistId: toplist.id },
      });

      // Create new items with positions (simplified — no overrides)
      await tx.toplistItem.createMany({
        data: validation.data.items.map((item, index) => ({
          toplistId: toplist.id,
          brandId: item.brandId,
          position: index,
          cta: item.cta,
          reviewUrl: item.reviewUrl,
        })),
      });

      // Update toplist timestamp
      await tx.toplist.update({
        where: { id: toplist.id },
        data: { updatedAt: new Date() },
      });
    });

    // Fetch and return the updated toplist
    const updatedToplist = await prisma.toplist.findUnique({
      where: { id: toplist.id },
      include: {
        items: {
          include: { brand: true },
          orderBy: { position: "asc" },
        },
      },
    });

    return NextResponse.json({
      success: true,
      itemCount: updatedToplist?.items.length || 0,
      updatedAt: updatedToplist?.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Error updating toplist items:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
