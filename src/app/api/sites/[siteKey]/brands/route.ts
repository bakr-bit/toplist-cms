import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions, isValidApiKey } from "@/lib/auth";
import { createSiteBrandSchema } from "@/lib/validations";

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

// GET /api/sites/[siteKey]/brands - List all SiteBrands for a site (protected)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteKey: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session && !isValidApiKey(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siteKey } = await params;

    const siteBrands = await prisma.siteBrand.findMany({
      where: { siteKey },
      include: {
        brand: {
          select: {
            name: true,
            defaultLogo: true,
            website: true,
          },
        },
      },
      orderBy: { brand: { name: "asc" } },
    });

    return NextResponse.json(
      siteBrands.map((sb) => ({
        siteKey: sb.siteKey,
        brandId: sb.brandId,
        brandName: sb.brand.name,
        brandLogo: sb.logo || sb.brand.defaultLogo,
        brandWebsite: sb.brand.website,
        logo: sb.logo,
        bonus: sb.bonus,
        affiliateUrl: sb.affiliateUrl,
        rating: sb.rating ? Number(sb.rating) : null,
        terms: sb.terms,
        description: sb.description,
        pros: sb.pros,
        cons: sb.cons,
        welcomePackage: sb.welcomePackage,
        noDepositBonus: sb.noDepositBonus,
        freeSpinsOffer: sb.freeSpinsOffer,
        wageringRequirement: sb.wageringRequirement,
        loyaltyProgram: sb.loyaltyProgram,
        promotions: sb.promotions,
        features: sb.features,
        badgeText: sb.badgeText,
        badgeColor: sb.badgeColor,
        createdAt: sb.createdAt.toISOString(),
        updatedAt: sb.updatedAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error("Error fetching site brands:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/sites/[siteKey]/brands - Create a SiteBrand (protected)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ siteKey: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session && !isValidApiKey(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siteKey } = await params;
    const body = await request.json();

    const validation = createSiteBrandSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    // Verify site exists
    const site = await prisma.site.findUnique({
      where: { siteKey },
    });
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    // Verify brand exists
    const brand = await prisma.brand.findUnique({
      where: { brandId: validation.data.brandId },
    });
    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Check if already exists
    const existing = await prisma.siteBrand.findUnique({
      where: {
        siteKey_brandId: { siteKey, brandId: validation.data.brandId },
      },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Brand is already associated with this site" },
        { status: 409 }
      );
    }

    const { brandId, ...dealData } = validation.data;
    const data = transformJsonFields(dealData as Record<string, unknown>);

    const siteBrand = await prisma.siteBrand.create({
      data: {
        siteKey,
        brandId,
        ...data,
      } as Prisma.SiteBrandUncheckedCreateInput,
    });

    return NextResponse.json(siteBrand, { status: 201 });
  } catch (error) {
    console.error("Error creating site brand:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
