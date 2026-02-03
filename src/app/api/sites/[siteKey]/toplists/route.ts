import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions, isValidApiKey } from "@/lib/auth";
import { createToplistSchema } from "@/lib/validations";

// GET /api/sites/[siteKey]/toplists - List all toplists for a site (protected)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteKey: string }> }
) {
  try {
    const { siteKey } = await params;

    const toplists = await prisma.toplist.findMany({
      where: { siteKey },
      include: {
        _count: {
          select: { items: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(
      toplists.map((t) => ({
        id: t.id,
        siteKey: t.siteKey,
        slug: t.slug,
        title: t.title,
        itemCount: t._count.items,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error("Error fetching toplists:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/sites/[siteKey]/toplists - Create a new toplist (protected)
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

    const validation = createToplistSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    // Check if site exists
    const site = await prisma.site.findUnique({
      where: { siteKey },
    });

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    // Check if slug already exists for this site
    const existing = await prisma.toplist.findUnique({
      where: {
        siteKey_slug: { siteKey, slug: validation.data.slug },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Toplist with this slug already exists" },
        { status: 409 }
      );
    }

    const toplist = await prisma.toplist.create({
      data: {
        siteKey,
        slug: validation.data.slug,
        title: validation.data.title,
      },
    });

    return NextResponse.json(toplist, { status: 201 });
  } catch (error) {
    console.error("Error creating toplist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
