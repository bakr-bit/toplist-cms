import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Schema for validating toplist import JSON
const toplistItemSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  logo: z.string().optional(),
  affiliateUrl: z.string().optional(),
  bonus: z.string().optional(),
  rating: z.number().min(0).max(10).optional(),
});

const toplistDefinitionSchema = z.object({
  id: z.string(),
  items: z.array(z.string()),
  variant: z.string().optional(),
});

const importToplistSchema = z.object({
  version: z.string().optional(),
  extractedAt: z.string().optional(),
  items: z.record(z.string(), toplistItemSchema),
  toplists: z.record(z.string(), toplistDefinitionSchema),
  pageMapping: z.record(z.string(), z.array(z.string())),
});

// POST /api/sites/[siteKey]/toplists/import - Import toplists from JSON (protected)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ siteKey: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siteKey } = await params;

    // Check if site exists
    const site = await prisma.site.findUnique({
      where: { siteKey },
    });

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const body = await request.json();

    // Validate JSON structure
    const validation = importToplistSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid JSON format", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { items, toplists, pageMapping } = validation.data;

    const results = {
      imported: 0,
      skipped: 0,
      errors: [] as { slug: string; error: string }[],
      warnings: [] as string[],
    };

    // Get existing toplist slugs for this site
    const existingToplists = await prisma.toplist.findMany({
      where: { siteKey },
      select: { slug: true },
    });
    const existingSlugs = new Set(existingToplists.map((t) => t.slug));

    // Get existing brand IDs to validate references
    const existingBrands = await prisma.brand.findMany({
      select: { brandId: true },
    });
    const existingBrandIds = new Set(existingBrands.map((b) => b.brandId));

    // Build mapping: toplistId → pages[] from pageMapping
    const toplistToPages: Record<string, string[]> = {};
    for (const [page, toplistIds] of Object.entries(pageMapping)) {
      for (const toplistId of toplistIds) {
        toplistToPages[toplistId] ??= [];
        toplistToPages[toplistId].push(page);
      }
    }

    // Process each toplist definition (not pageMapping)
    for (const [slug, toplistDef] of Object.entries(toplists)) {
      // Skip if toplist already exists
      if (existingSlugs.has(slug)) {
        results.skipped++;
        continue;
      }

      // Find which pages use this toplist
      const pages = toplistToPages[slug] || [];

      try {
        // Prepare toplist items
        const toplistItems = toplistDef.items
          .map((itemId, index) => {
            const itemData = items[itemId];
            if (!itemData) {
              results.warnings.push(
                `Item "${itemId}" not found in items for toplist "${slug}"`
              );
              return null;
            }

            // Check if brand exists
            if (!existingBrandIds.has(itemId)) {
              results.warnings.push(
                `Brand "${itemId}" not found in database, skipping item in "${slug}"`
              );
              return null;
            }

            return {
              brandId: itemId,
              position: index + 1,
              logoOverride: itemData.logo || null,
              affiliateUrl: itemData.affiliateUrl || null,
              bonus: itemData.bonus || null,
              rating: itemData.rating ?? null,
            };
          })
          .filter((item): item is NonNullable<typeof item> => item !== null);

        // Create toplist with items and linked pages
        await prisma.toplist.create({
          data: {
            siteKey,
            slug,
            title: formatSlugToTitle(slug),
            pages,
            items: {
              create: toplistItems,
            },
          },
        });

        results.imported++;
        existingSlugs.add(slug);
      } catch (error) {
        results.errors.push({
          slug,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      imported: results.imported,
      skipped: results.skipped,
      errors: results.errors,
      warnings: results.warnings,
      total: Object.keys(toplists).length,
    });
  } catch (error) {
    console.error("Error importing toplists:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Convert slug to title (e.g., "bonus-de-bun-venit" -> "Bonus De Bun Venit")
function formatSlugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
