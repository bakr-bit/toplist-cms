import sharp from "sharp";

export interface ImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "webp" | "png" | "jpeg";
}

const DEFAULT_OPTIONS: ImageOptions = {
  maxWidth: 400,
  maxHeight: 200,
  quality: 85,
  format: "webp",
};

export async function processImage(
  buffer: Buffer,
  options: ImageOptions = {}
): Promise<{ buffer: Buffer; contentType: string }> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  let pipeline = sharp(buffer);

  // Resize maintaining aspect ratio, fitting within bounds
  pipeline = pipeline.resize(opts.maxWidth, opts.maxHeight, {
    fit: "inside",
    withoutEnlargement: true,
  });

  // Convert to target format
  switch (opts.format) {
    case "webp":
      pipeline = pipeline.webp({ quality: opts.quality });
      break;
    case "png":
      pipeline = pipeline.png({ quality: opts.quality });
      break;
    case "jpeg":
      pipeline = pipeline.jpeg({ quality: opts.quality });
      break;
  }

  const processedBuffer = await pipeline.toBuffer();

  return {
    buffer: processedBuffer,
    contentType: `image/${opts.format}`,
  };
}

export function generateImageKey(
  type: "brand" | "toplist-item",
  identifier: string,
  extension: string = "webp"
): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  // Sanitize identifier to be URL-safe
  const safeIdentifier = identifier.replace(/[^a-zA-Z0-9-_]/g, "-");
  return `${type}/${safeIdentifier}/${timestamp}-${randomSuffix}.${extension}`;
}
