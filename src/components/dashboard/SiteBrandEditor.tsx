"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import { TagInput } from "@/components/ui/tag-input";

export interface SiteBrandFormState {
  logo: string;
  bonus: string;
  affiliateUrl: string;
  rating: string;
  terms: string;
  description: string;
  pros: string[];
  cons: string[];
  welcomePackage: string;
  noDepositBonus: string;
  freeSpinsOffer: string;
  wageringRequirement: string;
  loyaltyProgram: string;
  promotions: string;
  features: string[];
  badgeText: string;
  badgeColor: string;
}

export const INITIAL_SITE_BRAND_STATE: SiteBrandFormState = {
  logo: "",
  bonus: "",
  affiliateUrl: "",
  rating: "",
  terms: "",
  description: "",
  pros: [],
  cons: [],
  welcomePackage: "",
  noDepositBonus: "",
  freeSpinsOffer: "",
  wageringRequirement: "",
  loyaltyProgram: "",
  promotions: "",
  features: [],
  badgeText: "",
  badgeColor: "",
};

export interface SiteBrandApiData {
  siteKey: string;
  brandId: string;
  brandName: string;
  brandLogo: string | null;
  logo: string | null;
  bonus: string | null;
  affiliateUrl: string | null;
  rating: number | null;
  terms: string | null;
  description: string | null;
  pros: string[] | null;
  cons: string[] | null;
  welcomePackage: string | null;
  noDepositBonus: string | null;
  freeSpinsOffer: string | null;
  wageringRequirement: string | null;
  loyaltyProgram: string | null;
  promotions: string | null;
  features: string[] | null;
  badgeText: string | null;
  badgeColor: string | null;
}

function asStr(val: unknown): string {
  if (val === null || val === undefined) return "";
  return String(val);
}

function asArr(val: unknown): string[] {
  return Array.isArray(val) ? val : [];
}

export function apiToSiteBrandForm(data: SiteBrandApiData): SiteBrandFormState {
  return {
    logo: asStr(data.logo),
    bonus: asStr(data.bonus),
    affiliateUrl: asStr(data.affiliateUrl),
    rating: data.rating != null ? String(data.rating) : "",
    terms: asStr(data.terms),
    description: asStr(data.description),
    pros: asArr(data.pros),
    cons: asArr(data.cons),
    welcomePackage: asStr(data.welcomePackage),
    noDepositBonus: asStr(data.noDepositBonus),
    freeSpinsOffer: asStr(data.freeSpinsOffer),
    wageringRequirement: asStr(data.wageringRequirement),
    loyaltyProgram: asStr(data.loyaltyProgram),
    promotions: asStr(data.promotions),
    features: asArr(data.features),
    badgeText: asStr(data.badgeText),
    badgeColor: asStr(data.badgeColor),
  };
}

export function getSiteBrandPayload(state: SiteBrandFormState): Record<string, unknown> {
  const nullIfEmpty = (val: string) => val || null;
  const arrOrNull = (val: string[]) => (val.length > 0 ? val : null);
  const numOrNull = (val: string) => (val ? parseFloat(val) : null);

  return {
    logo: nullIfEmpty(state.logo),
    bonus: nullIfEmpty(state.bonus),
    affiliateUrl: nullIfEmpty(state.affiliateUrl),
    rating: numOrNull(state.rating),
    terms: nullIfEmpty(state.terms),
    description: nullIfEmpty(state.description),
    pros: arrOrNull(state.pros),
    cons: arrOrNull(state.cons),
    welcomePackage: nullIfEmpty(state.welcomePackage),
    noDepositBonus: nullIfEmpty(state.noDepositBonus),
    freeSpinsOffer: nullIfEmpty(state.freeSpinsOffer),
    wageringRequirement: nullIfEmpty(state.wageringRequirement),
    loyaltyProgram: nullIfEmpty(state.loyaltyProgram),
    promotions: nullIfEmpty(state.promotions),
    features: arrOrNull(state.features),
    badgeText: nullIfEmpty(state.badgeText),
    badgeColor: nullIfEmpty(state.badgeColor),
  };
}

const TABS = [
  "Deal & Bonus",
  "Editorial",
  "Promotions",
] as const;

type Tab = (typeof TABS)[number];

interface SiteBrandEditorProps {
  brandId: string;
  siteKey: string;
  state: SiteBrandFormState;
  updateField: <K extends keyof SiteBrandFormState>(
    field: K,
    value: SiteBrandFormState[K]
  ) => void;
}

export function SiteBrandEditor({ brandId, siteKey, state, updateField }: SiteBrandEditorProps) {
  const [activeTab, setActiveTab] = useState<Tab>("Deal & Bonus");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 [&_input]:bg-white [&_textarea]:bg-white">
      {/* Left column */}
      <div className="space-y-5">
        <div className="space-y-2">
          <Label>Logo Override</Label>
          <ImageUpload
            value={state.logo}
            onChange={(v) => updateField("logo", v)}
            type="brand"
            identifier={`${siteKey}-${brandId}`}
          />
          <p className="text-xs text-zinc-500">Leave empty to use the brand&apos;s default logo</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rating">Rating (0-10)</Label>
          <Input
            id="rating"
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={state.rating}
            onChange={(e) => updateField("rating", e.target.value)}
            placeholder="e.g. 8.5"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="affiliateUrl">Affiliate URL</Label>
          <Input
            id="affiliateUrl"
            type="url"
            value={state.affiliateUrl}
            onChange={(e) => updateField("affiliateUrl", e.target.value)}
            placeholder="https://..."
          />
        </div>
      </div>

      {/* Right column — tabbed sections */}
      <div className="lg:col-span-2">
        <div className="flex flex-wrap gap-1 border-b mb-4 pb-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="space-y-5">
          {activeTab === "Deal & Bonus" && (
            <DealTab state={state} updateField={updateField} />
          )}
          {activeTab === "Editorial" && (
            <EditorialTab state={state} updateField={updateField} />
          )}
          {activeTab === "Promotions" && (
            <PromotionsTab state={state} updateField={updateField} />
          )}
        </div>
      </div>
    </div>
  );
}

interface TabProps {
  state: SiteBrandFormState;
  updateField: <K extends keyof SiteBrandFormState>(
    field: K,
    value: SiteBrandFormState[K]
  ) => void;
}

function DealTab({ state, updateField }: TabProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="bonus">Bonus</Label>
        <Input
          id="bonus"
          value={state.bonus}
          onChange={(e) => updateField("bonus", e.target.value)}
          placeholder="e.g. 100% up to $500"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="welcomePackage">Welcome Package</Label>
        <Input
          id="welcomePackage"
          value={state.welcomePackage}
          onChange={(e) => updateField("welcomePackage", e.target.value)}
          placeholder="e.g. 100% up to €500 + 200 Free Spins"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="noDepositBonus">No Deposit Bonus</Label>
        <Input
          id="noDepositBonus"
          value={state.noDepositBonus}
          onChange={(e) => updateField("noDepositBonus", e.target.value)}
          placeholder="e.g. 20 Free Spins on registration"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="freeSpinsOffer">Free Spins Offer</Label>
        <Input
          id="freeSpinsOffer"
          value={state.freeSpinsOffer}
          onChange={(e) => updateField("freeSpinsOffer", e.target.value)}
          placeholder="e.g. 200 Free Spins on Book of Dead"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="wageringRequirement">Wagering Requirement</Label>
        <Input
          id="wageringRequirement"
          value={state.wageringRequirement}
          onChange={(e) => updateField("wageringRequirement", e.target.value)}
          placeholder="e.g. 35x"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="terms">Terms & Conditions</Label>
        <Input
          id="terms"
          value={state.terms}
          onChange={(e) => updateField("terms", e.target.value)}
          placeholder="e.g. 18+ T&Cs apply"
        />
      </div>
    </>
  );
}

function EditorialTab({ state, updateField }: TabProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={state.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Site-specific brand description..."
          rows={4}
        />
      </div>
      <div className="space-y-2">
        <Label>Pros</Label>
        <TagInput
          value={state.pros}
          onChange={(v) => updateField("pros", v)}
          placeholder="Add a pro and press Enter..."
        />
      </div>
      <div className="space-y-2">
        <Label>Cons</Label>
        <TagInput
          value={state.cons}
          onChange={(v) => updateField("cons", v)}
          placeholder="Add a con and press Enter..."
        />
      </div>
      <div className="space-y-2">
        <Label>Features (max 3)</Label>
        <TagInput
          value={state.features}
          onChange={(v) => updateField("features", v)}
          maxItems={3}
          placeholder="Add a feature and press Enter..."
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="badgeText">Badge Text</Label>
          <Input
            id="badgeText"
            value={state.badgeText}
            onChange={(e) => updateField("badgeText", e.target.value)}
            placeholder="e.g. €20 Minimum deposit"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="badgeColor">Badge Color</Label>
          <Input
            id="badgeColor"
            value={state.badgeColor}
            onChange={(e) => updateField("badgeColor", e.target.value)}
            placeholder="e.g. Blue, Green"
          />
        </div>
      </div>
    </>
  );
}

function PromotionsTab({ state, updateField }: TabProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="loyaltyProgram">Loyalty Program</Label>
        <Input
          id="loyaltyProgram"
          value={state.loyaltyProgram}
          onChange={(e) => updateField("loyaltyProgram", e.target.value)}
          placeholder="e.g. VIP Club with 5 tiers"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="promotions">Promotions</Label>
        <Input
          id="promotions"
          value={state.promotions}
          onChange={(e) => updateField("promotions", e.target.value)}
          placeholder="e.g. Weekly cashback, tournaments"
        />
      </div>
    </>
  );
}
