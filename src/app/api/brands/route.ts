import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions, isValidApiKey } from "@/lib/auth";
import { createBrandSchema } from "@/lib/validations";

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

    return NextResponse.json(
      brands.map((b) => ({
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
        usageCount: b._count.toplistItems,
        createdAt: b.createdAt.toISOString(),
        updatedAt: b.updatedAt.toISOString(),
      }))
    );
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

    const brand = await prisma.brand.create({
      data,
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
