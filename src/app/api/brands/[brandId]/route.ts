import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateBrandSchema } from "@/lib/validations";

// GET /api/brands/[brandId] - Get a specific brand (protected)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
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
      defaultBonus: brand.defaultBonus,
      defaultAffiliateUrl: brand.defaultAffiliateUrl,
      defaultRating: brand.defaultRating ? Number(brand.defaultRating) : null,
      terms: brand.terms,
      license: brand.license,
      description: brand.description,
      pros: brand.pros,
      cons: brand.cons,
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
    if (!session) {
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

    // Transform null JSON fields to Prisma.JsonNull
    const data = {
      ...validation.data,
      pros:
        validation.data.pros === null
          ? Prisma.JsonNull
          : validation.data.pros ?? undefined,
      cons:
        validation.data.cons === null
          ? Prisma.JsonNull
          : validation.data.cons ?? undefined,
    };

    const brand = await prisma.brand.update({
      where: { brandId },
      data,
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
    if (!session) {
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
