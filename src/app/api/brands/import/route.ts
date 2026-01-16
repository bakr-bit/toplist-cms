import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { uploadToR2 } from "@/lib/r2";
import { processImage, generateImageKey } from "@/lib/image";

// Schema for validating import JSON
const importBrandSchema = z.object({
  slug: z.string().min(1),
  affiliateUrl: z.string().optional(),
  rating: z.number().min(0).max(10).optional(),
  license: z.string().optional(),
  bonus: z.string().optional(),
  pros: z.array(z.string()).optional(),
  cons: z.array(z.string()).optional(),
  description: z.string().optional(),
  logo: z.string().url().optional(),
});

// Fetch image from URL and upload to R2
async function fetchAndUploadLogo(
  logoUrl: string,
  brandId: string
): Promise<string | null> {
  try {
    const response = await fetch(logoUrl);
    if (!response.ok) return null;

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) return null;

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process and upload to R2
    const { buffer: processedBuffer, contentType: newContentType } =
      await processImage(buffer);
    const key = generateImageKey("brand", brandId);
    const r2Url = await uploadToR2(key, processedBuffer, newContentType);

    return r2Url;
  } catch (error) {
    console.error(`Failed to fetch/upload logo for ${brandId}:`, error);
    return null;
  }
}

const importSchema = z.object({
  version: z.string().optional(),
  extractedAt: z.string().optional(),
  brands: z.record(z.string(), importBrandSchema),
});

// POST /api/brands/import - Import brands from JSON (protected)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON format" },
        { status: 400 }
      );
    }

    // Validate JSON structure
    const validation = importSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid JSON format", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { brands } = validation.data;
    const results = {
      imported: 0,
      skipped: 0,
      errors: [] as { name: string; error: string }[],
    };

    // Get existing brand IDs to check for duplicates
    const existingBrands = await prisma.brand.findMany({
      select: { brandId: true },
    });
    const existingIds = new Set(existingBrands.map((b) => b.brandId));

    // Process each brand
    for (const [name, data] of Object.entries(brands)) {
      const brandId = data.slug;

      // Skip if brand already exists
      if (existingIds.has(brandId)) {
        results.skipped++;
        continue;
      }

      try {
        // Fetch and upload logo if provided
        let logoUrl: string | null = null;
        if (data.logo) {
          logoUrl = await fetchAndUploadLogo(data.logo, brandId);
        }

        await prisma.brand.create({
          data: {
            brandId,
            name,
            defaultLogo: logoUrl,
            defaultAffiliateUrl: data.affiliateUrl || null,
            defaultBonus: data.bonus || null,
            defaultRating: data.rating ?? null,
            license: data.license || null,
            description: data.description || null,
            pros: data.pros ? data.pros : Prisma.JsonNull,
            cons: data.cons ? data.cons : Prisma.JsonNull,
          },
        });
        results.imported++;
        existingIds.add(brandId); // Track newly added to prevent duplicates within same import
      } catch (error) {
        results.errors.push({
          name,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      imported: results.imported,
      skipped: results.skipped,
      errors: results.errors,
      total: Object.keys(brands).length,
    });
  } catch (error) {
    console.error("Error importing brands:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
