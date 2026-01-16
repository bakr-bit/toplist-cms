import { z } from "zod";

// Brand schemas
export const createBrandSchema = z.object({
  brandId: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Brand ID must be lowercase alphanumeric with dashes"),
  name: z.string().min(1).max(200),
  defaultLogo: z.string().url().optional().nullable(),
  website: z.string().url().optional().nullable(),
  defaultBonus: z.string().max(500).optional().nullable(),
  defaultAffiliateUrl: z.string().url().optional().nullable(),
  defaultRating: z.number().min(0).max(10).optional().nullable(),
  terms: z.string().max(500).optional().nullable(),
  license: z.string().max(100).optional().nullable(),
  description: z.string().optional().nullable(),
  pros: z.array(z.string()).optional().nullable(),
  cons: z.array(z.string()).optional().nullable(),
});

export const updateBrandSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  defaultLogo: z.string().url().optional().nullable(),
  website: z.string().url().optional().nullable(),
  defaultBonus: z.string().max(500).optional().nullable(),
  defaultAffiliateUrl: z.string().url().optional().nullable(),
  defaultRating: z.number().min(0).max(10).optional().nullable(),
  terms: z.string().max(500).optional().nullable(),
  license: z.string().max(100).optional().nullable(),
  description: z.string().optional().nullable(),
  pros: z.array(z.string()).optional().nullable(),
  cons: z.array(z.string()).optional().nullable(),
});

// Site schemas
export const createSiteSchema = z.object({
  domain: z
    .string()
    .min(1)
    .max(253)
    .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/, "Invalid domain format"),
  name: z.string().min(1).max(200),
  geo: z.string().max(100).optional().nullable(),
  keywords: z.array(z.string()).optional().nullable(),
});

export const updateSiteSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  geo: z.string().max(100).optional().nullable(),
  keywords: z.array(z.string()).optional().nullable(),
});

// Toplist schemas
export const createToplistSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
  title: z.string().max(200).optional().nullable(),
});

export const updateToplistSchema = z.object({
  title: z.string().max(200).optional().nullable(),
});

// Toplist items schema
export const toplistItemSchema = z.object({
  brandId: z.string().min(1),
  bonus: z.string().max(500).optional().nullable(),
  affiliateUrl: z.string().url().optional().nullable(),
  reviewUrl: z.string().max(500).optional().nullable(),
  rating: z.number().min(0).max(10).optional().nullable(),
  cta: z.string().max(100).optional().nullable(),
  logoOverride: z.string().url().optional().nullable(),
  termsOverride: z.string().max(500).optional().nullable(),
  licenseOverride: z.string().max(100).optional().nullable(),
  prosOverride: z.array(z.string()).optional().nullable(),
  consOverride: z.array(z.string()).optional().nullable(),
});

export const updateToplistItemsSchema = z.object({
  items: z.array(toplistItemSchema),
});

// Helper to convert domain to siteKey
export function domainToSiteKey(domain: string): string {
  return domain.toLowerCase().replace(/\./g, "-");
}

// Types
export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;
export type CreateSiteInput = z.infer<typeof createSiteSchema>;
export type UpdateSiteInput = z.infer<typeof updateSiteSchema>;
export type CreateToplistInput = z.infer<typeof createToplistSchema>;
export type UpdateToplistInput = z.infer<typeof updateToplistSchema>;
export type ToplistItemInput = z.infer<typeof toplistItemSchema>;
export type UpdateToplistItemsInput = z.infer<typeof updateToplistItemsSchema>;
