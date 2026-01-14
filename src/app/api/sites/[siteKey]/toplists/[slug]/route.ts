import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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
      rating: item.rating ? Number(item.rating) : null,
      cta: item.cta,
      terms: item.termsOverride || item.brand.terms,
      license: item.licenseOverride || item.brand.license,
      pros: item.prosOverride || item.brand.pros,
      cons: item.consOverride || item.brand.cons,
    }));

    return NextResponse.json(
      {
        siteKey: toplist.siteKey,
        slug: toplist.slug,
        title: toplist.title,
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
    if (!session) {
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

    const toplist = await prisma.toplist.update({
      where: {
        siteKey_slug: { siteKey, slug },
      },
      data: validation.data,
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
    if (!session) {
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
