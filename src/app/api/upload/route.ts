import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadToR2, deleteFromR2, getKeyFromUrl } from "@/lib/r2";
import { processImage, generateImageKey } from "@/lib/image";
import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

const uploadMetaSchema = z.object({
  type: z.enum(["brand", "toplist-item"]),
  identifier: z.string().min(1).max(100),
  previousUrl: z.string().url().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const metaString = formData.get("meta") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, GIF, WebP" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum 5MB" },
        { status: 400 }
      );
    }

    // Parse and validate metadata
    let meta: z.infer<typeof uploadMetaSchema>;
    try {
      meta = uploadMetaSchema.parse(JSON.parse(metaString || "{}"));
    } catch {
      return NextResponse.json({ error: "Invalid metadata" }, { status: 400 });
    }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process image (resize, convert to webp)
    const { buffer: processedBuffer, contentType } = await processImage(buffer);

    // Generate unique key
    const key = generateImageKey(meta.type, meta.identifier);

    // Upload to R2
    const url = await uploadToR2(key, processedBuffer, contentType);

    // Delete previous image if provided
    if (meta.previousUrl) {
      const previousKey = getKeyFromUrl(meta.previousUrl);
      if (previousKey) {
        try {
          await deleteFromR2(previousKey);
        } catch (err) {
          console.error("Failed to delete previous image:", err);
          // Don't fail the request if deletion fails
        }
      }
    }

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
