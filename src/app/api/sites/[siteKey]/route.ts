import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateSiteSchema } from "@/lib/validations";

// GET /api/sites/[siteKey] - Get a specific site with toplists (protected)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteKey: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siteKey } = await params;

    const site = await prisma.site.findUnique({
      where: { siteKey },
      include: {
        toplists: {
          include: {
            _count: {
              select: { items: true },
            },
          },
          orderBy: { updatedAt: "desc" },
        },
      },
    });

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    return NextResponse.json({
      siteKey: site.siteKey,
      domain: site.domain,
      name: site.name,
      createdAt: site.createdAt.toISOString(),
      toplists: site.toplists.map((t) => ({
        id: t.id,
        slug: t.slug,
        title: t.title,
        itemCount: t._count.items,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching site:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/sites/[siteKey] - Update a site (protected)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ siteKey: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siteKey } = await params;
    const body = await request.json();

    const validation = updateSiteSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const site = await prisma.site.update({
      where: { siteKey },
      data: validation.data,
    });

    return NextResponse.json(site);
  } catch (error) {
    console.error("Error updating site:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/sites/[siteKey] - Delete a site (protected, cascades toplists)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ siteKey: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siteKey } = await params;

    // Get count of toplists that will be deleted
    const toplistCount = await prisma.toplist.count({
      where: { siteKey },
    });

    await prisma.site.delete({
      where: { siteKey },
    });

    return NextResponse.json({
      success: true,
      deletedToplistCount: toplistCount,
    });
  } catch (error) {
    console.error("Error deleting site:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
