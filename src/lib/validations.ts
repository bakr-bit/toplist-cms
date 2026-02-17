import { z } from "zod";

// Shared brand extended fields (global facts only — no deal/editorial fields)
const brandExtendedFields = {
  yearEstablished: z.number().int().min(1900).max(2100).optional().nullable(),
  ownerOperator: z.string().max(200).optional().nullable(),
  languages: z.array(z.string()).optional().nullable(),
  availableCountries: z.array(z.string()).optional().nullable(),
  restrictedCountries: z.array(z.string()).optional().nullable(),
  currencies: z.array(z.string()).optional().nullable(),
  paymentMethods: z.array(z.string()).optional().nullable(),
  withdrawalTime: z.string().max(200).optional().nullable(),
  minDeposit: z.string().max(100).optional().nullable(),
  minWithdrawal: z.string().max(100).optional().nullable(),
  maxWithdrawal: z.string().max(200).optional().nullable(),
  sportsBetting: z.boolean().optional().nullable(),
  cryptoCasino: z.boolean().optional().nullable(),
  vpnAllowed: z.boolean().optional().nullable(),
  kycRequired: z.boolean().optional().nullable(),
  gameProviders: z.array(z.string()).optional().nullable(),
  totalGames: z.number().int().min(0).optional().nullable(),
  gameTypes: z.array(z.string()).optional().nullable(),
  exclusiveGames: z.string().max(500).optional().nullable(),
  supportContacts: z.string().max(500).optional().nullable(),
  supportHours: z.string().max(200).optional().nullable(),
  supportLanguages: z.array(z.string()).optional().nullable(),
  mobileCompatibility: z.string().max(200).optional().nullable(),
  registrationProcess: z.string().max(500).optional().nullable(),
  kycProcess: z.string().max(500).optional().nullable(),
};

// Brand schemas (global facts only)
export const createBrandSchema = z.object({
  brandId: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Brand ID must be lowercase alphanumeric with dashes"),
  name: z.string().min(1).max(200),
  defaultLogo: z.string().url().optional().nullable(),
  website: z.string().url().optional().nullable(),
  license: z.string().max(100).optional().nullable(),
  ...brandExtendedFields,
});

export const updateBrandSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  defaultLogo: z.string().url().optional().nullable(),
  website: z.string().url().optional().nullable(),
  license: z.string().max(100).optional().nullable(),
  ...brandExtendedFields,
});

// SiteBrand schemas (deal/editorial per site)
export const createSiteBrandSchema = z.object({
  brandId: z.string().min(1),
  logo: z.string().url().optional().nullable(),
  bonus: z.string().max(500).optional().nullable(),
  affiliateUrl: z.string().url().optional().nullable(),
  rating: z.number().min(0).max(10).optional().nullable(),
  terms: z.string().max(500).optional().nullable(),
  description: z.string().optional().nullable(),
  pros: z.array(z.string()).optional().nullable(),
  cons: z.array(z.string()).optional().nullable(),
  welcomePackage: z.string().max(500).optional().nullable(),
  noDepositBonus: z.string().max(500).optional().nullable(),
  freeSpinsOffer: z.string().max(500).optional().nullable(),
  wageringRequirement: z.string().max(200).optional().nullable(),
  loyaltyProgram: z.string().max(500).optional().nullable(),
  promotions: z.string().max(500).optional().nullable(),
  features: z.array(z.string()).max(3).optional().nullable(),
  badgeText: z.string().max(200).optional().nullable(),
  badgeColor: z.string().max(50).optional().nullable(),
});

export const updateSiteBrandSchema = z.object({
  logo: z.string().url().optional().nullable(),
  bonus: z.string().max(500).optional().nullable(),
  affiliateUrl: z.string().url().optional().nullable(),
  rating: z.number().min(0).max(10).optional().nullable(),
  terms: z.string().max(500).optional().nullable(),
  description: z.string().optional().nullable(),
  pros: z.array(z.string()).optional().nullable(),
  cons: z.array(z.string()).optional().nullable(),
  welcomePackage: z.string().max(500).optional().nullable(),
  noDepositBonus: z.string().max(500).optional().nullable(),
  freeSpinsOffer: z.string().max(500).optional().nullable(),
  wageringRequirement: z.string().max(200).optional().nullable(),
  loyaltyProgram: z.string().max(500).optional().nullable(),
  promotions: z.string().max(500).optional().nullable(),
  features: z.array(z.string()).max(3).optional().nullable(),
  badgeText: z.string().max(200).optional().nullable(),
  badgeColor: z.string().max(50).optional().nullable(),
});

// SERP schema (keyword + geo pair)
export const serpSchema = z.object({
  keyword: z.string().min(1).max(500),
  geo: z.string().length(2, "GEO must be a 2-letter country code").toUpperCase(),
});

// Site schemas
export const createSiteSchema = z.object({
  domain: z
    .string()
    .min(1)
    .max(253)
    .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/, "Invalid domain format"),
  name: z.string().min(1).max(200),
  serps: z.array(serpSchema).optional().nullable(),
});

export const updateSiteSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  serps: z.array(serpSchema).optional().nullable(),
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
  columns: z.array(z.string().max(50)).max(30).optional().nullable(),
  columnLabels: z.record(z.string().max(50), z.string().max(100)).optional().nullable(),
});

// Toplist items schema
export const toplistItemSchema = z.object({
  brandId: z.string().min(1),
  cta: z.string().max(100).optional().nullable(),
  reviewUrl: z.string().max(500).optional().nullable(),
  // Per-toplist text overrides (override SiteBrand defaults)
  bonus: z.string().max(500).optional().nullable(),
  description: z.string().optional().nullable(),
  terms: z.string().max(500).optional().nullable(),
  badgeText: z.string().max(200).optional().nullable(),
  badgeColor: z.string().max(50).optional().nullable(),
});

export const updateToplistItemsSchema = z.object({
  items: z.array(toplistItemSchema),
});

// Helper to convert domain to siteKey
export function domainToSiteKey(domain: string): string {
  return domain.toLowerCase().replace(/\./g, "-");
}

// Types
export type Serp = z.infer<typeof serpSchema>;
export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;
export type CreateSiteBrandInput = z.infer<typeof createSiteBrandSchema>;
export type UpdateSiteBrandInput = z.infer<typeof updateSiteBrandSchema>;
export type CreateSiteInput = z.infer<typeof createSiteSchema>;
export type UpdateSiteInput = z.infer<typeof updateSiteSchema>;
export type CreateToplistInput = z.infer<typeof createToplistSchema>;
export type UpdateToplistInput = z.infer<typeof updateToplistSchema>;
export type ToplistItemInput = z.infer<typeof toplistItemSchema>;
export type UpdateToplistItemsInput = z.infer<typeof updateToplistItemsSchema>;
