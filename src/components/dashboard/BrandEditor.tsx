"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import { ToggleGrid, ToggleOption } from "@/components/ui/toggle-grid";
import { TagInput } from "@/components/ui/tag-input";
import { BrandFormState } from "@/lib/use-brand-form";
import { PAYMENT_METHODS } from "@/lib/payment-methods";
import { GAME_TYPES } from "@/lib/game-types";
import { GAME_PROVIDERS } from "@/lib/game-providers";
import { CURRENCIES } from "@/lib/currencies";
import { COUNTRIES, LANGUAGES } from "@/lib/countries";

// Convert registries to ToggleOption format
const paymentOptions: ToggleOption[] = PAYMENT_METHODS.map((m) => ({
  id: m.id,
  label: m.name,
  icon: m.icon,
}));

const gameTypeOptions: ToggleOption[] = GAME_TYPES.map((t) => ({
  id: t.id,
  label: `${t.emoji} ${t.name}`,
}));

const gameProviderOptions: ToggleOption[] = GAME_PROVIDERS.map((p) => ({
  id: p.id,
  label: p.name,
}));

const currencyOptions: ToggleOption[] = CURRENCIES.map((c) => ({
  id: c.id,
  label: `${c.symbol} ${c.id}`,
}));

const countryOptions: ToggleOption[] = COUNTRIES.map((c) => ({
  id: c.id,
  label: `${c.flag} ${c.name}`,
}));

const languageOptions: ToggleOption[] = LANGUAGES.map((l) => ({
  id: l.id,
  label: l.name,
}));

const TABS = [
  "Bonuses & Promotions",
  "Payment",
  "Games",
  "Geo & Languages",
  "Display & Card",
  "Other",
] as const;

type Tab = (typeof TABS)[number];

interface BrandEditorProps {
  brandId: string;
  state: BrandFormState;
  updateField: <K extends keyof BrandFormState>(
    field: K,
    value: BrandFormState[K]
  ) => void;
}

export function BrandEditor({ brandId, state, updateField }: BrandEditorProps) {
  const [activeTab, setActiveTab] = useState<Tab>("Bonuses & Promotions");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 [&_input]:bg-white [&_textarea]:bg-white [&_select]:bg-white">
      {/* Left column */}
      <div className="space-y-5">
        <div className="space-y-2">
          <Label>Logo</Label>
          <ImageUpload
            value={state.defaultLogo}
            onChange={(v) => updateField("defaultLogo", v)}
            type="brand"
            identifier={brandId}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-zinc-500">Brand ID</Label>
          <Input value={brandId} disabled className="font-mono text-sm bg-zinc-50" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={state.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="e.g. VeloBet Casino"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            value={state.website}
            onChange={(e) => updateField("website", e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="defaultRating">Rating (0-10)</Label>
          <Input
            id="defaultRating"
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={state.defaultRating}
            onChange={(e) => updateField("defaultRating", e.target.value)}
            placeholder="e.g. 8.5"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="yearEstablished">Year Established</Label>
          <Input
            id="yearEstablished"
            type="number"
            min="1900"
            max="2100"
            value={state.yearEstablished}
            onChange={(e) => updateField("yearEstablished", e.target.value)}
            placeholder="e.g. 2020"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ownerOperator">Owner / Operator</Label>
          <Input
            id="ownerOperator"
            value={state.ownerOperator}
            onChange={(e) => updateField("ownerOperator", e.target.value)}
            placeholder="e.g. Dama N.V."
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
          {activeTab === "Bonuses & Promotions" && (
            <BonusesTab state={state} updateField={updateField} />
          )}
          {activeTab === "Payment" && (
            <FinancialTab state={state} updateField={updateField} />
          )}
          {activeTab === "Games" && (
            <GamesTab state={state} updateField={updateField} />
          )}
          {activeTab === "Geo & Languages" && (
            <GeoTab state={state} updateField={updateField} />
          )}
          {activeTab === "Display & Card" && (
            <DisplayTab state={state} updateField={updateField} />
          )}
          {activeTab === "Other" && (
            <OtherTab state={state} updateField={updateField} />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Tab Components ──────────────────────────────────────────────────

interface TabProps {
  state: BrandFormState;
  updateField: <K extends keyof BrandFormState>(
    field: K,
    value: BrandFormState[K]
  ) => void;
}

function BonusesTab({ state, updateField }: TabProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="defaultBonus">Default Bonus</Label>
        <Input
          id="defaultBonus"
          value={state.defaultBonus}
          onChange={(e) => updateField("defaultBonus", e.target.value)}
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
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sportsBetting">Sports Betting</Label>
          <select
            id="sportsBetting"
            value={state.sportsBetting}
            onChange={(e) => updateField("sportsBetting", e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Not specified</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="cryptoCasino">Crypto</Label>
          <select
            id="cryptoCasino"
            value={state.cryptoCasino}
            onChange={(e) => updateField("cryptoCasino", e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Not specified</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="vpnAllowed">VPN Allowed</Label>
          <select
            id="vpnAllowed"
            value={state.vpnAllowed}
            onChange={(e) => updateField("vpnAllowed", e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Not specified</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="kycRequired">KYC Required</Label>
          <select
            id="kycRequired"
            value={state.kycRequired}
            onChange={(e) => updateField("kycRequired", e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Not specified</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="defaultAffiliateUrl">Default Affiliate URL</Label>
        <Input
          id="defaultAffiliateUrl"
          type="url"
          value={state.defaultAffiliateUrl}
          onChange={(e) => updateField("defaultAffiliateUrl", e.target.value)}
          placeholder="https://..."
        />
      </div>
    </>
  );
}

function FinancialTab({ state, updateField }: TabProps) {
  return (
    <>
      <div className="space-y-2">
        <Label>Currencies</Label>
        <ToggleGrid
          options={currencyOptions}
          selected={state.currencies}
          onChange={(v) => updateField("currencies", v)}
          columns={4}
          allowCustom
        />
      </div>
      <div className="space-y-2">
        <Label>Payment Methods</Label>
        <ToggleGrid
          options={paymentOptions}
          selected={state.paymentMethods}
          onChange={(v) => updateField("paymentMethods", v)}
          columns={2}
          allowCustom
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="minDeposit">Min Deposit</Label>
          <Input
            id="minDeposit"
            value={state.minDeposit}
            onChange={(e) => updateField("minDeposit", e.target.value)}
            placeholder="e.g. €20"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minWithdrawal">Min Withdrawal</Label>
          <Input
            id="minWithdrawal"
            value={state.minWithdrawal}
            onChange={(e) => updateField("minWithdrawal", e.target.value)}
            placeholder="e.g. €20"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="maxWithdrawal">Max Withdrawal</Label>
          <Input
            id="maxWithdrawal"
            value={state.maxWithdrawal}
            onChange={(e) => updateField("maxWithdrawal", e.target.value)}
            placeholder="e.g. €5000/month"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="withdrawalTime">Withdrawal Time</Label>
          <Input
            id="withdrawalTime"
            value={state.withdrawalTime}
            onChange={(e) => updateField("withdrawalTime", e.target.value)}
            placeholder="e.g. 24-48 hours"
          />
        </div>
      </div>
    </>
  );
}

function GamesTab({ state, updateField }: TabProps) {
  return (
    <>
      <div className="space-y-2">
        <Label>Game Types</Label>
        <ToggleGrid
          options={gameTypeOptions}
          selected={state.gameTypes}
          onChange={(v) => updateField("gameTypes", v)}
          columns={3}
          allowCustom
        />
      </div>
      <div className="space-y-2">
        <Label>Game Providers</Label>
        <ToggleGrid
          options={gameProviderOptions}
          selected={state.gameProviders}
          onChange={(v) => updateField("gameProviders", v)}
          searchable
          columns={3}
          maxHeight="20rem"
          allowCustom
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="totalGames">Total Games</Label>
          <Input
            id="totalGames"
            type="number"
            min="0"
            value={state.totalGames}
            onChange={(e) => updateField("totalGames", e.target.value)}
            placeholder="e.g. 3000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="exclusiveGames">Exclusive Games</Label>
          <Input
            id="exclusiveGames"
            value={state.exclusiveGames}
            onChange={(e) => updateField("exclusiveGames", e.target.value)}
            placeholder="e.g. 50+ exclusive slots"
          />
        </div>
      </div>
    </>
  );
}

function GeoTab({ state, updateField }: TabProps) {
  return (
    <>
      <div className="space-y-2">
        <Label>Languages</Label>
        <ToggleGrid
          options={languageOptions}
          selected={state.languages}
          onChange={(v) => updateField("languages", v)}
          searchable
          columns={4}
          allowCustom
        />
      </div>
      <div className="space-y-2">
        <Label>Available Countries</Label>
        <ToggleGrid
          options={countryOptions}
          selected={state.availableCountries}
          onChange={(v) => updateField("availableCountries", v)}
          searchable
          columns={3}
          maxHeight="20rem"
          allowCustom
        />
      </div>
      <div className="space-y-2">
        <Label>Restricted Countries</Label>
        <ToggleGrid
          options={countryOptions}
          selected={state.restrictedCountries}
          onChange={(v) => updateField("restrictedCountries", v)}
          searchable
          columns={3}
          maxHeight="20rem"
          allowCustom
        />
      </div>
      <div className="space-y-2">
        <Label>Support Languages</Label>
        <ToggleGrid
          options={languageOptions}
          selected={state.supportLanguages}
          onChange={(v) => updateField("supportLanguages", v)}
          searchable
          columns={4}
          allowCustom
        />
      </div>
    </>
  );
}

function DisplayTab({ state, updateField }: TabProps) {
  return (
    <>
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
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={state.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Brand description..."
          rows={4}
        />
      </div>
    </>
  );
}

function OtherTab({ state, updateField }: TabProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="supportContacts">Support Contacts</Label>
        <Input
          id="supportContacts"
          value={state.supportContacts}
          onChange={(e) => updateField("supportContacts", e.target.value)}
          placeholder="e.g. Live Chat, Email: support@..."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="supportHours">Support Hours</Label>
        <Input
          id="supportHours"
          value={state.supportHours}
          onChange={(e) => updateField("supportHours", e.target.value)}
          placeholder="e.g. 24/7"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="license">License</Label>
        <Input
          id="license"
          value={state.license}
          onChange={(e) => updateField("license", e.target.value)}
          placeholder="e.g. MGA, Curacao"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="mobileCompatibility">Mobile Compatibility</Label>
        <Input
          id="mobileCompatibility"
          value={state.mobileCompatibility}
          onChange={(e) => updateField("mobileCompatibility", e.target.value)}
          placeholder="e.g. Full mobile browser support, iOS/Android apps"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="registrationProcess">Registration Process</Label>
        <Input
          id="registrationProcess"
          value={state.registrationProcess}
          onChange={(e) => updateField("registrationProcess", e.target.value)}
          placeholder="e.g. Quick 2-step registration"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="kycProcess">KYC Process</Label>
        <Input
          id="kycProcess"
          value={state.kycProcess}
          onChange={(e) => updateField("kycProcess", e.target.value)}
          placeholder="e.g. ID + Proof of address required"
        />
      </div>
    </>
  );
}
