import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions, isValidApiKey } from "@/lib/auth";
import { updateSiteBrandSchema } from "@/lib/validations";
import { canAccessSite } from "@/lib/auth";

// JSON fields that need Prisma.JsonNull handling
const jsonFields = ["pros", "cons", "features"] as const;

function transformJsonFields(data: Record<string, unknown>) {
  const result = { ...data };
  for (const field of jsonFields) {
    if (field in result) {
      if (result[field] === null) {
        result[field] = Prisma.JsonNull;
      } else if (result[field] === undefined) {
        delete result[field];
      }
    }
  }
  return result;
}

// GET /api/sites/[siteKey]/brands/[brandId] - Get one SiteBrand (site-scoped)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteKey: string; brandId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session && !isValidApiKey(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siteKey, brandId } = await params;

    if (session && !canAccessSite(session, siteKey)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const siteBrand = await prisma.siteBrand.findUnique({
      where: {
        siteKey_brandId: { siteKey, brandId },
      },
      include: {
        brand: {
          select: {
            name: true,
            defaultLogo: true,
            website: true,
          },
        },
      },
    });

    if (!siteBrand) {
      return NextResponse.json(
        { error: "Site brand not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      siteKey: siteBrand.siteKey,
      brandId: siteBrand.brandId,
      brandName: siteBrand.brand.name,
      brandLogo: siteBrand.logo || siteBrand.brand.defaultLogo,
      brandWebsite: siteBrand.brand.website,
      logo: siteBrand.logo,
      bonus: siteBrand.bonus,
      affiliateUrl: siteBrand.affiliateUrl,
      rating: siteBrand.rating ? Number(siteBrand.rating) : null,
      terms: siteBrand.terms,
      description: siteBrand.description,
      pros: siteBrand.pros,
      cons: siteBrand.cons,
      welcomePackage: siteBrand.welcomePackage,
      noDepositBonus: siteBrand.noDepositBonus,
      freeSpinsOffer: siteBrand.freeSpinsOffer,
      wageringRequirement: siteBrand.wageringRequirement,
      loyaltyProgram: siteBrand.loyaltyProgram,
      promotions: siteBrand.promotions,
      features: siteBrand.features,
      badgeText: siteBrand.badgeText,
      badgeColor: siteBrand.badgeColor,
      createdAt: siteBrand.createdAt.toISOString(),
      updatedAt: siteBrand.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Error fetching site brand:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/sites/[siteKey]/brands/[brandId] - Update SiteBrand deal data (site-scoped)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ siteKey: string; brandId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session && !isValidApiKey(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siteKey, brandId } = await params;

    if (session && !canAccessSite(session, siteKey)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await request.json();

    const validation = updateSiteBrandSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = transformJsonFields(validation.data as Record<string, unknown>);

    const siteBrand = await prisma.siteBrand.update({
      where: {
        siteKey_brandId: { siteKey, brandId },
      },
      data: data as Prisma.SiteBrandUpdateInput,
    });

    return NextResponse.json(siteBrand);
  } catch (error) {
    console.error("Error updating site brand:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/sites/[siteKey]/brands/[brandId] - Remove brand from site (site-scoped)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ siteKey: string; brandId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session && !isValidApiKey(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siteKey, brandId } = await params;

    if (session && !canAccessSite(session, siteKey)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if brand is used in any toplist for this site
    const usageCount = await prisma.toplistItem.count({
      where: {
        brandId,
        toplist: { siteKey },
      },
    });

    if (usageCount > 0) {
      return NextResponse.json(
        {
          error: "Cannot remove brand from site while it is used in toplists",
          usageCount,
        },
        { status: 409 }
      );
    }

    await prisma.siteBrand.delete({
      where: {
        siteKey_brandId: { siteKey, brandId },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting site brand:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
