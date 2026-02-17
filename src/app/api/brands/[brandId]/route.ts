import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions, isValidApiKey } from "@/lib/auth";
import { updateBrandSchema } from "@/lib/validations";

// JSON fields that need Prisma.JsonNull handling
const jsonFields = [
  "languages", "availableCountries", "restrictedCountries",
  "currencies", "paymentMethods", "gameProviders", "gameTypes",
  "supportLanguages",
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

// GET /api/brands/[brandId] - Get a specific brand (protected)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session && !isValidApiKey(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { brandId } = await params;

    const brand = await prisma.brand.findUnique({
      where: { brandId },
      include: {
        _count: {
          select: { toplistItems: true },
        },
      },
    });

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    return NextResponse.json({
      brandId: brand.brandId,
      name: brand.name,
      defaultLogo: brand.defaultLogo,
      website: brand.website,
      license: brand.license,
      yearEstablished: brand.yearEstablished,
      ownerOperator: brand.ownerOperator,
      languages: brand.languages,
      availableCountries: brand.availableCountries,
      restrictedCountries: brand.restrictedCountries,
      currencies: brand.currencies,
      paymentMethods: brand.paymentMethods,
      withdrawalTime: brand.withdrawalTime,
      minDeposit: brand.minDeposit,
      minWithdrawal: brand.minWithdrawal,
      maxWithdrawal: brand.maxWithdrawal,
      sportsBetting: brand.sportsBetting,
      cryptoCasino: brand.cryptoCasino,
      vpnAllowed: brand.vpnAllowed,
      kycRequired: brand.kycRequired,
      gameProviders: brand.gameProviders,
      totalGames: brand.totalGames,
      gameTypes: brand.gameTypes,
      exclusiveGames: brand.exclusiveGames,
      supportContacts: brand.supportContacts,
      supportHours: brand.supportHours,
      supportLanguages: brand.supportLanguages,
      mobileCompatibility: brand.mobileCompatibility,
      registrationProcess: brand.registrationProcess,
      kycProcess: brand.kycProcess,
      usageCount: brand._count.toplistItems,
      createdAt: brand.createdAt.toISOString(),
      updatedAt: brand.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Error fetching brand:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/brands/[brandId] - Update a brand (protected)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session && !isValidApiKey(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { brandId } = await params;
    const body = await request.json();

    const validation = updateBrandSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = transformJsonFields(validation.data as Record<string, unknown>);

    const brand = await prisma.brand.update({
      where: { brandId },
      data: data as Prisma.BrandUpdateInput,
    });

    return NextResponse.json(brand);
  } catch (error) {
    console.error("Error updating brand:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/brands/[brandId] - Delete a brand (protected)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session && !isValidApiKey(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { brandId } = await params;

    // Use transaction to atomically check usage and delete
    try {
      await prisma.$transaction(async (tx) => {
        const usageCount = await tx.toplistItem.count({
          where: { brandId },
        });

        if (usageCount > 0) {
          throw new Error(`BRAND_IN_USE:${usageCount}`);
        }

        await tx.brand.delete({
          where: { brandId },
        });
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("BRAND_IN_USE:")) {
        const usageCount = parseInt(error.message.split(":")[1], 10);
        return NextResponse.json(
          {
            error: "Cannot delete brand that is used in toplists",
            usageCount,
          },
          { status: 409 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Error deleting brand:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
