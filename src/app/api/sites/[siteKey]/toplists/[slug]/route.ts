import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions, isValidApiKey } from "@/lib/auth";
import { updateToplistSchema } from "@/lib/validations";

// CORS headers for public endpoint
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET /api/sites/[siteKey]/toplists/[slug] - Public endpoint
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteKey: string; slug: string }> }
) {
  try {
    const { siteKey, slug } = await params;

    // Case-insensitive slug matching
    const toplist = await prisma.toplist.findFirst({
      where: {
        siteKey: { equals: siteKey, mode: "insensitive" },
        slug: { equals: slug, mode: "insensitive" },
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
        { status: 404, headers: corsHeaders }
      );
    }

    // Transform items to match expected client format
    // Override fields take precedence over brand defaults
    const items = toplist.items.map((item) => ({
      brandId: item.brandId,
      name: item.brand.name,
      logo: item.logoOverride || item.brand.defaultLogo,
      affiliateUrl: item.affiliateUrl || item.brand.defaultAffiliateUrl,
      reviewUrl: item.reviewUrl,
      bonus: item.bonus || item.brand.defaultBonus,
      rating: item.rating
        ? Number(item.rating)
        : item.brand.defaultRating
          ? Number(item.brand.defaultRating)
          : null,
      cta: item.cta,
      terms: item.termsOverride || item.brand.terms,
      license: item.licenseOverride || item.brand.license,
      description: item.brand.description,
      pros: item.prosOverride || item.brand.pros,
      cons: item.consOverride || item.brand.cons,
      website: item.brand.website,
      yearEstablished: item.brand.yearEstablished,
      ownerOperator: item.brand.ownerOperator,
      languages: item.brand.languages,
      availableCountries: item.brand.availableCountries,
      restrictedCountries: item.brand.restrictedCountries,
      currencies: item.brand.currencies,
      paymentMethods: item.brand.paymentMethods,
      withdrawalTime: item.brand.withdrawalTime,
      minDeposit: item.brand.minDeposit,
      minWithdrawal: item.brand.minWithdrawal,
      maxWithdrawal: item.brand.maxWithdrawal,
      welcomePackage: item.brand.welcomePackage,
      sportsBetting: item.brand.sportsBetting,
      noDepositBonus: item.brand.noDepositBonus,
      freeSpinsOffer: item.brand.freeSpinsOffer,
      loyaltyProgram: item.brand.loyaltyProgram,
      promotions: item.brand.promotions,
      gameProviders: item.brand.gameProviders,
      totalGames: item.brand.totalGames,
      gameTypes: item.brand.gameTypes,
      exclusiveGames: item.brand.exclusiveGames,
      supportContacts: item.brand.supportContacts,
      supportHours: item.brand.supportHours,
      supportLanguages: item.brand.supportLanguages,
      mobileCompatibility: item.brand.mobileCompatibility,
      registrationProcess: item.brand.registrationProcess,
      kycProcess: item.brand.kycProcess,
      features: item.brand.features,
      badgeText: item.brand.badgeText,
      badgeColor: item.brand.badgeColor,
    }));

    return NextResponse.json(
      {
        siteKey: toplist.siteKey,
        slug: toplist.slug,
        title: toplist.title,
        columns: toplist.columns,
        columnLabels: toplist.columnLabels,
        updatedAt: toplist.updatedAt.toISOString(),
        items,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error fetching toplist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// PUT /api/sites/[siteKey]/toplists/[slug] - Update toplist metadata (protected)
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

    const validation = updateToplistSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { columns, columnLabels, ...rest } = validation.data;
    const data: any = { ...rest };
    if (columns !== undefined) {
      data.columns = columns === null ? Prisma.JsonNull : columns;
    }
    if (columnLabels !== undefined) {
      data.columnLabels = columnLabels === null ? Prisma.JsonNull : columnLabels;
    }

    const toplist = await prisma.toplist.update({
      where: {
        siteKey_slug: { siteKey, slug },
      },
      data,
    });

    return NextResponse.json(toplist);
  } catch (error) {
    console.error("Error updating toplist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/sites/[siteKey]/toplists/[slug] - Delete toplist (protected)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ siteKey: string; slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session && !isValidApiKey(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siteKey, slug } = await params;

    await prisma.toplist.delete({
      where: {
        siteKey_slug: { siteKey, slug },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting toplist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
