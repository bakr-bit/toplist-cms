import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createSiteSchema, domainToSiteKey } from "@/lib/validations";

// GET /api/sites - List all sites (protected)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sites = await prisma.site.findMany({
      include: {
        _count: {
          select: { toplists: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(
      sites.map((s) => ({
        siteKey: s.siteKey,
        domain: s.domain,
        name: s.name,
        serps: s.serps,
        toplistCount: s._count.toplists,
        createdAt: s.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error("Error fetching sites:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/sites - Create a new site (protected)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const validation = createSiteSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const siteKey = domainToSiteKey(validation.data.domain);

    // Check if site already exists
    const existing = await prisma.site.findFirst({
      where: {
        OR: [{ siteKey }, { domain: validation.data.domain }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Site with this domain already exists" },
        { status: 409 }
      );
    }

    const site = await prisma.site.create({
      data: {
        siteKey,
        domain: validation.data.domain,
        name: validation.data.name,
        serps: validation.data.serps ?? Prisma.DbNull,
      },
    });

    return NextResponse.json(site, { status: 201 });
  } catch (error) {
    console.error("Error creating site:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
