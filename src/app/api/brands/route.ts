import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions, isValidApiKey } from "@/lib/auth";
import { createBrandSchema } from "@/lib/validations";

// JSON fields that need Prisma.JsonNull handling
const jsonFields = [
  "pros", "cons", "languages", "availableCountries", "restrictedCountries",
  "currencies", "paymentMethods", "gameProviders", "gameTypes",
  "supportLanguages", "features",
] as const;

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

function mapBrandResponse(b: Record<string, unknown> & { _count?: { toplistItems: number }; defaultRating?: unknown; createdAt?: Date; updatedAt?: Date }) {
  return {
    brandId: b.brandId,
    name: b.name,
    defaultLogo: b.defaultLogo,
    website: b.website,
    defaultBonus: b.defaultBonus,
    defaultAffiliateUrl: b.defaultAffiliateUrl,
    defaultRating: b.defaultRating ? Number(b.defaultRating) : null,
    terms: b.terms,
    license: b.license,
    description: b.description,
    pros: b.pros,
    cons: b.cons,
    yearEstablished: b.yearEstablished,
    ownerOperator: b.ownerOperator,
    languages: b.languages,
    availableCountries: b.availableCountries,
    restrictedCountries: b.restrictedCountries,
    currencies: b.currencies,
    paymentMethods: b.paymentMethods,
    withdrawalTime: b.withdrawalTime,
    minDeposit: b.minDeposit,
    minWithdrawal: b.minWithdrawal,
    maxWithdrawal: b.maxWithdrawal,
    welcomePackage: b.welcomePackage,
    sportsBetting: b.sportsBetting,
    noDepositBonus: b.noDepositBonus,
    freeSpinsOffer: b.freeSpinsOffer,
    loyaltyProgram: b.loyaltyProgram,
    promotions: b.promotions,
    gameProviders: b.gameProviders,
    totalGames: b.totalGames,
    gameTypes: b.gameTypes,
    exclusiveGames: b.exclusiveGames,
    supportContacts: b.supportContacts,
    supportHours: b.supportHours,
    supportLanguages: b.supportLanguages,
    mobileCompatibility: b.mobileCompatibility,
    registrationProcess: b.registrationProcess,
    kycProcess: b.kycProcess,
    features: b.features,
    badgeText: b.badgeText,
    badgeColor: b.badgeColor,
    usageCount: b._count?.toplistItems,
    createdAt: b.createdAt?.toISOString(),
    updatedAt: b.updatedAt?.toISOString(),
  };
}

// GET /api/brands - List all brands (protected)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session && !isValidApiKey(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const brands = await prisma.brand.findMany({
      include: {
        _count: {
          select: { toplistItems: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(brands.map((b) => mapBrandResponse(b as never)));
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/brands - Create a new brand (protected)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session && !isValidApiKey(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const validation = createBrandSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    // Check if brand already exists
    const existing = await prisma.brand.findUnique({
      where: { brandId: validation.data.brandId },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Brand with this ID already exists" },
        { status: 409 }
      );
    }

    const data = transformJsonFields(validation.data as Record<string, unknown>);

    const brand = await prisma.brand.create({
      data: data as Prisma.BrandCreateInput,
    });

    return NextResponse.json(brand, { status: 201 });
  } catch (error) {
    console.error("Error creating brand:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
