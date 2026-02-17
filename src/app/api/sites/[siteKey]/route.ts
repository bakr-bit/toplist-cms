import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions, isValidApiKey } from "@/lib/auth";
import { updateSiteSchema } from "@/lib/validations";
import { isAdmin, canAccessSite } from "@/lib/auth";

// GET /api/sites/[siteKey] - Get a specific site with toplists (site-scoped)
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

    if (session && !canAccessSite(session, siteKey)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
      serps: site.serps,
      createdAt: site.createdAt.toISOString(),
      toplists: site.toplists.map((t) => ({
        id: t.id,
        slug: t.slug,
        title: t.title,
        pages: t.pages,
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

// PUT /api/sites/[siteKey] - Update a site (site-scoped)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ siteKey: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session && !isValidApiKey(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siteKey } = await params;

    if (session && !canAccessSite(session, siteKey)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await request.json();

    const validation = updateSiteSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const updateData: Prisma.SiteUpdateInput = {
      ...(validation.data.name && { name: validation.data.name }),
    };

    // Handle serps field - use DbNull for null values
    if (validation.data.serps !== undefined) {
      updateData.serps = validation.data.serps ?? Prisma.DbNull;
    }

    const site = await prisma.site.update({
      where: { siteKey },
      data: updateData,
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

// DELETE /api/sites/[siteKey] - Delete a site (admin-only, cascades toplists)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ siteKey: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session && !isValidApiKey(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session && !isAdmin(session)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
