"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageUpload } from "@/components/ui/image-upload";
import { ChevronDown } from "lucide-react";

interface Brand {
  brandId: string;
  name: string;
  defaultLogo: string | null;
  website: string | null;
  defaultBonus: string | null;
  defaultAffiliateUrl: string | null;
  defaultRating: number | null;
  terms: string | null;
  license: string | null;
  description: string | null;
  pros: string[] | null;
  cons: string[] | null;
  yearEstablished: number | null;
  ownerOperator: string | null;
  languages: string[] | null;
  availableCountries: string[] | null;
  restrictedCountries: string[] | null;
  currencies: string[] | null;
  paymentMethods: string[] | null;
  withdrawalTime: string | null;
  minDeposit: string | null;
  minWithdrawal: string | null;
  maxWithdrawal: string | null;
  welcomePackage: string | null;
  sportsBetting: boolean | null;
  noDepositBonus: string | null;
  freeSpinsOffer: string | null;
  loyaltyProgram: string | null;
  promotions: string | null;
  gameProviders: string[] | null;
  totalGames: number | null;
  gameTypes: string[] | null;
  exclusiveGames: string | null;
  supportContacts: string | null;
  supportHours: string | null;
  supportLanguages: string[] | null;
  mobileCompatibility: string | null;
  registrationProcess: string | null;
  kycProcess: string | null;
  features: string[] | null;
  badgeText: string | null;
  badgeColor: string | null;
}

interface BrandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand?: Brand | null;
  onSuccess: () => void;
}

function FormSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border rounded-lg">
      <button
        type="button"
        className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        onClick={() => setOpen(!open)}
      >
        {title}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="space-y-4 px-3 pb-3">{children}</div>}
    </div>
  );
}

export function BrandDialog({
  open,
  onOpenChange,
  brand,
  onSuccess,
}: BrandDialogProps) {
  const isEditing = !!brand;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Core fields
  const [brandId, setBrandId] = useState("");
  const [name, setName] = useState("");
  const [defaultLogo, setDefaultLogo] = useState("");
  const [website, setWebsite] = useState("");
  const [defaultBonus, setDefaultBonus] = useState("");
  const [defaultAffiliateUrl, setDefaultAffiliateUrl] = useState("");
  const [defaultRating, setDefaultRating] = useState("");
  const [terms, setTerms] = useState("");
  const [license, setLicense] = useState("");
  const [description, setDescription] = useState("");
  const [pros, setPros] = useState("");
  const [cons, setCons] = useState("");

  // Extended fields
  const [yearEstablished, setYearEstablished] = useState("");
  const [ownerOperator, setOwnerOperator] = useState("");
  const [languages, setLanguages] = useState("");
  const [availableCountries, setAvailableCountries] = useState("");
  const [restrictedCountries, setRestrictedCountries] = useState("");
  const [currencies, setCurrencies] = useState("");
  const [paymentMethods, setPaymentMethods] = useState("");
  const [withdrawalTime, setWithdrawalTime] = useState("");
  const [minDeposit, setMinDeposit] = useState("");
  const [minWithdrawal, setMinWithdrawal] = useState("");
  const [maxWithdrawal, setMaxWithdrawal] = useState("");
  const [welcomePackage, setWelcomePackage] = useState("");
  const [sportsBetting, setSportsBetting] = useState("");
  const [noDepositBonus, setNoDepositBonus] = useState("");
  const [freeSpinsOffer, setFreeSpinsOffer] = useState("");
  const [loyaltyProgram, setLoyaltyProgram] = useState("");
  const [promotions, setPromotions] = useState("");
  const [gameProviders, setGameProviders] = useState("");
  const [totalGames, setTotalGames] = useState("");
  const [gameTypes, setGameTypes] = useState("");
  const [exclusiveGames, setExclusiveGames] = useState("");
  const [supportContacts, setSupportContacts] = useState("");
  const [supportHours, setSupportHours] = useState("");
  const [supportLanguages, setSupportLanguages] = useState("");
  const [mobileCompatibility, setMobileCompatibility] = useState("");
  const [registrationProcess, setRegistrationProcess] = useState("");
  const [kycProcess, setKycProcess] = useState("");
  const [features, setFeatures] = useState("");
  const [badgeText, setBadgeText] = useState("");
  const [badgeColor, setBadgeColor] = useState("");

  // Helper to join array for display
  const arrToLines = (arr: string[] | null | undefined) =>
    arr?.join("\n") || "";
  const arrToCommas = (arr: string[] | null | undefined) =>
    arr?.join(", ") || "";

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setBrandId(brand?.brandId || "");
      setName(brand?.name || "");
      setDefaultLogo(brand?.defaultLogo || "");
      setWebsite(brand?.website || "");
      setDefaultBonus(brand?.defaultBonus || "");
      setDefaultAffiliateUrl(brand?.defaultAffiliateUrl || "");
      setDefaultRating(brand?.defaultRating?.toString() || "");
      setTerms(brand?.terms || "");
      setLicense(brand?.license || "");
      setDescription(brand?.description || "");
      setPros(arrToLines(brand?.pros));
      setCons(arrToLines(brand?.cons));
      setYearEstablished(brand?.yearEstablished?.toString() || "");
      setOwnerOperator(brand?.ownerOperator || "");
      setLanguages(arrToCommas(brand?.languages));
      setAvailableCountries(arrToCommas(brand?.availableCountries));
      setRestrictedCountries(arrToCommas(brand?.restrictedCountries));
      setCurrencies(arrToCommas(brand?.currencies));
      setPaymentMethods(arrToCommas(brand?.paymentMethods));
      setWithdrawalTime(brand?.withdrawalTime || "");
      setMinDeposit(brand?.minDeposit || "");
      setMinWithdrawal(brand?.minWithdrawal || "");
      setMaxWithdrawal(brand?.maxWithdrawal || "");
      setWelcomePackage(brand?.welcomePackage || "");
      setSportsBetting(
        brand?.sportsBetting === true
          ? "yes"
          : brand?.sportsBetting === false
            ? "no"
            : ""
      );
      setNoDepositBonus(brand?.noDepositBonus || "");
      setFreeSpinsOffer(brand?.freeSpinsOffer || "");
      setLoyaltyProgram(brand?.loyaltyProgram || "");
      setPromotions(brand?.promotions || "");
      setGameProviders(arrToCommas(brand?.gameProviders));
      setTotalGames(brand?.totalGames?.toString() || "");
      setGameTypes(arrToCommas(brand?.gameTypes));
      setExclusiveGames(brand?.exclusiveGames || "");
      setSupportContacts(brand?.supportContacts || "");
      setSupportHours(brand?.supportHours || "");
      setSupportLanguages(arrToCommas(brand?.supportLanguages));
      setMobileCompatibility(brand?.mobileCompatibility || "");
      setRegistrationProcess(brand?.registrationProcess || "");
      setKycProcess(brand?.kycProcess || "");
      setFeatures(arrToCommas(brand?.features));
      setBadgeText(brand?.badgeText || "");
      setBadgeColor(brand?.badgeColor || "");
      setError("");
    }
  }, [open, brand]);

  const textToArray = (text: string): string[] | null => {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    return lines.length > 0 ? lines : null;
  };

  const commaToArray = (text: string): string[] | null => {
    const items = text
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    return items.length > 0 ? items : null;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const url = isEditing ? `/api/brands/${brand.brandId}` : "/api/brands";
      const method = isEditing ? "PUT" : "POST";

      const commonFields = {
        name,
        defaultLogo: defaultLogo || null,
        website: website || null,
        defaultBonus: defaultBonus || null,
        defaultAffiliateUrl: defaultAffiliateUrl || null,
        defaultRating: defaultRating ? parseFloat(defaultRating) : null,
        terms: terms || null,
        license: license || null,
        description: description || null,
        pros: textToArray(pros),
        cons: textToArray(cons),
        yearEstablished: yearEstablished
          ? parseInt(yearEstablished, 10)
          : null,
        ownerOperator: ownerOperator || null,
        languages: commaToArray(languages),
        availableCountries: commaToArray(availableCountries),
        restrictedCountries: commaToArray(restrictedCountries),
        currencies: commaToArray(currencies),
        paymentMethods: commaToArray(paymentMethods),
        withdrawalTime: withdrawalTime || null,
        minDeposit: minDeposit || null,
        minWithdrawal: minWithdrawal || null,
        maxWithdrawal: maxWithdrawal || null,
        welcomePackage: welcomePackage || null,
        sportsBetting:
          sportsBetting === "yes"
            ? true
            : sportsBetting === "no"
              ? false
              : null,
        noDepositBonus: noDepositBonus || null,
        freeSpinsOffer: freeSpinsOffer || null,
        loyaltyProgram: loyaltyProgram || null,
        promotions: promotions || null,
        gameProviders: commaToArray(gameProviders),
        totalGames: totalGames ? parseInt(totalGames, 10) : null,
        gameTypes: commaToArray(gameTypes),
        exclusiveGames: exclusiveGames || null,
        supportContacts: supportContacts || null,
        supportHours: supportHours || null,
        supportLanguages: commaToArray(supportLanguages),
        mobileCompatibility: mobileCompatibility || null,
        registrationProcess: registrationProcess || null,
        kycProcess: kycProcess || null,
        features: commaToArray(features),
        badgeText: badgeText || null,
        badgeColor: badgeColor || null,
      };

      const body = isEditing ? commonFields : { brandId, ...commonFields };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save brand");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Brand" : "Add Brand"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Always visible: Brand ID, Name, Logo, Website */}
          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="brandId">Brand ID</Label>
              <Input
                id="brandId"
                value={brandId}
                onChange={(e) =>
                  setBrandId(
                    e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-")
                  )
                }
                placeholder="e.g. velobet-casino"
                required
              />
              <p className="text-xs text-zinc-500">
                Lowercase letters, numbers, and dashes only
              </p>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. VeloBet Casino"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Logo</Label>
            <ImageUpload
              value={defaultLogo}
              onChange={setDefaultLogo}
              type="brand"
              identifier={brandId || "new-brand"}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://..."
            />
          </div>

          {/* Basic Info */}
          <FormSection title="Basic Info" defaultOpen>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="yearEstablished">Year Established</Label>
                <Input
                  id="yearEstablished"
                  type="number"
                  min="1900"
                  max="2100"
                  value={yearEstablished}
                  onChange={(e) => setYearEstablished(e.target.value)}
                  placeholder="e.g. 2020"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerOperator">Owner / Operator</Label>
                <Input
                  id="ownerOperator"
                  value={ownerOperator}
                  onChange={(e) => setOwnerOperator(e.target.value)}
                  placeholder="e.g. Dama N.V."
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brand description..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultRating">Default Rating (0-10)</Label>
              <Input
                id="defaultRating"
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={defaultRating}
                onChange={(e) => setDefaultRating(e.target.value)}
                placeholder="e.g. 8.5"
              />
            </div>
          </FormSection>

          {/* Bonuses & Affiliate */}
          <FormSection title="Bonuses & Affiliate" defaultOpen>
            <div className="space-y-2">
              <Label htmlFor="defaultBonus">Default Bonus</Label>
              <Input
                id="defaultBonus"
                value={defaultBonus}
                onChange={(e) => setDefaultBonus(e.target.value)}
                placeholder="e.g. 100% up to $500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultAffiliateUrl">Default Affiliate URL</Label>
              <Input
                id="defaultAffiliateUrl"
                type="url"
                value={defaultAffiliateUrl}
                onChange={(e) => setDefaultAffiliateUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="welcomePackage">Welcome Package</Label>
              <Input
                id="welcomePackage"
                value={welcomePackage}
                onChange={(e) => setWelcomePackage(e.target.value)}
                placeholder="e.g. 100% up to €500 + 200 Free Spins"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="noDepositBonus">No Deposit Bonus</Label>
              <Input
                id="noDepositBonus"
                value={noDepositBonus}
                onChange={(e) => setNoDepositBonus(e.target.value)}
                placeholder="e.g. 20 Free Spins on registration"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="freeSpinsOffer">Free Spins Offer</Label>
              <Input
                id="freeSpinsOffer"
                value={freeSpinsOffer}
                onChange={(e) => setFreeSpinsOffer(e.target.value)}
                placeholder="e.g. 200 Free Spins on Book of Dead"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="terms">Terms & Conditions</Label>
              <Input
                id="terms"
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                placeholder="e.g. 18+ T&Cs apply"
              />
            </div>
          </FormSection>

          {/* Promotions & Loyalty */}
          <FormSection title="Promotions & Loyalty">
            <div className="space-y-2">
              <Label htmlFor="loyaltyProgram">Loyalty Program</Label>
              <Input
                id="loyaltyProgram"
                value={loyaltyProgram}
                onChange={(e) => setLoyaltyProgram(e.target.value)}
                placeholder="e.g. VIP Club with 5 tiers"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="promotions">Promotions</Label>
              <Input
                id="promotions"
                value={promotions}
                onChange={(e) => setPromotions(e.target.value)}
                placeholder="e.g. Weekly cashback, tournaments"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sportsBetting">Sports Betting</Label>
              <select
                id="sportsBetting"
                value={sportsBetting}
                onChange={(e) => setSportsBetting(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Not specified</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </FormSection>

          {/* Games */}
          <FormSection title="Games">
            <div className="space-y-2">
              <Label htmlFor="gameProviders">Game Providers</Label>
              <Input
                id="gameProviders"
                value={gameProviders}
                onChange={(e) => setGameProviders(e.target.value)}
                placeholder="e.g. NetEnt, Microgaming, Play'n GO"
              />
              <p className="text-xs text-zinc-500">Comma-separated</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalGames">Total Games</Label>
                <Input
                  id="totalGames"
                  type="number"
                  min="0"
                  value={totalGames}
                  onChange={(e) => setTotalGames(e.target.value)}
                  placeholder="e.g. 3000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exclusiveGames">Exclusive Games</Label>
                <Input
                  id="exclusiveGames"
                  value={exclusiveGames}
                  onChange={(e) => setExclusiveGames(e.target.value)}
                  placeholder="e.g. 50+ exclusive slots"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gameTypes">Game Types</Label>
              <Input
                id="gameTypes"
                value={gameTypes}
                onChange={(e) => setGameTypes(e.target.value)}
                placeholder="e.g. Slots, Table Games, Live Casino"
              />
              <p className="text-xs text-zinc-500">Comma-separated</p>
            </div>
          </FormSection>

          {/* Geo & Languages */}
          <FormSection title="Geo & Languages">
            <div className="space-y-2">
              <Label htmlFor="languages">Languages</Label>
              <Input
                id="languages"
                value={languages}
                onChange={(e) => setLanguages(e.target.value)}
                placeholder="e.g. English, German, Finnish"
              />
              <p className="text-xs text-zinc-500">Comma-separated</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="availableCountries">Available Countries</Label>
              <Input
                id="availableCountries"
                value={availableCountries}
                onChange={(e) => setAvailableCountries(e.target.value)}
                placeholder="e.g. UK, DE, FI, CA"
              />
              <p className="text-xs text-zinc-500">Comma-separated</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="restrictedCountries">Restricted Countries</Label>
              <Input
                id="restrictedCountries"
                value={restrictedCountries}
                onChange={(e) => setRestrictedCountries(e.target.value)}
                placeholder="e.g. US, FR, AU"
              />
              <p className="text-xs text-zinc-500">Comma-separated</p>
            </div>
          </FormSection>

          {/* Financial */}
          <FormSection title="Financial">
            <div className="space-y-2">
              <Label htmlFor="currencies">Currencies</Label>
              <Input
                id="currencies"
                value={currencies}
                onChange={(e) => setCurrencies(e.target.value)}
                placeholder="e.g. EUR, USD, GBP, BTC"
              />
              <p className="text-xs text-zinc-500">Comma-separated</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentMethods">Payment Methods</Label>
              <Input
                id="paymentMethods"
                value={paymentMethods}
                onChange={(e) => setPaymentMethods(e.target.value)}
                placeholder="e.g. Visa, Mastercard, Skrill, Neteller"
              />
              <p className="text-xs text-zinc-500">Comma-separated</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minDeposit">Min Deposit</Label>
                <Input
                  id="minDeposit"
                  value={minDeposit}
                  onChange={(e) => setMinDeposit(e.target.value)}
                  placeholder="e.g. €20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minWithdrawal">Min Withdrawal</Label>
                <Input
                  id="minWithdrawal"
                  value={minWithdrawal}
                  onChange={(e) => setMinWithdrawal(e.target.value)}
                  placeholder="e.g. €20"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxWithdrawal">Max Withdrawal</Label>
                <Input
                  id="maxWithdrawal"
                  value={maxWithdrawal}
                  onChange={(e) => setMaxWithdrawal(e.target.value)}
                  placeholder="e.g. €5000/month"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="withdrawalTime">Withdrawal Time</Label>
                <Input
                  id="withdrawalTime"
                  value={withdrawalTime}
                  onChange={(e) => setWithdrawalTime(e.target.value)}
                  placeholder="e.g. 24-48 hours"
                />
              </div>
            </div>
          </FormSection>

          {/* Support */}
          <FormSection title="Support">
            <div className="space-y-2">
              <Label htmlFor="supportContacts">Support Contacts</Label>
              <Input
                id="supportContacts"
                value={supportContacts}
                onChange={(e) => setSupportContacts(e.target.value)}
                placeholder="e.g. Live Chat, Email: support@..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supportHours">Support Hours</Label>
              <Input
                id="supportHours"
                value={supportHours}
                onChange={(e) => setSupportHours(e.target.value)}
                placeholder="e.g. 24/7"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supportLanguages">Support Languages</Label>
              <Input
                id="supportLanguages"
                value={supportLanguages}
                onChange={(e) => setSupportLanguages(e.target.value)}
                placeholder="e.g. English, German"
              />
              <p className="text-xs text-zinc-500">Comma-separated</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="license">License</Label>
              <Input
                id="license"
                value={license}
                onChange={(e) => setLicense(e.target.value)}
                placeholder="e.g. MGA, Curacao"
              />
            </div>
          </FormSection>

          {/* Display & Card */}
          <FormSection title="Display & Card">
            <div className="space-y-2">
              <Label htmlFor="pros">Pros</Label>
              <Textarea
                id="pros"
                value={pros}
                onChange={(e) => setPros(e.target.value)}
                placeholder="One pro per line"
                rows={3}
              />
              <p className="text-xs text-zinc-500">Enter one pro per line</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cons">Cons</Label>
              <Textarea
                id="cons"
                value={cons}
                onChange={(e) => setCons(e.target.value)}
                placeholder="One con per line"
                rows={3}
              />
              <p className="text-xs text-zinc-500">Enter one con per line</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="features">Features</Label>
              <Input
                id="features"
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                placeholder="e.g. Fast Payouts, VIP Program, Live Casino"
              />
              <p className="text-xs text-zinc-500">
                Comma-separated, max 3 items
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="badgeText">Badge Text</Label>
                <Input
                  id="badgeText"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  placeholder="e.g. €20 Minimum deposit"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="badgeColor">Badge Color</Label>
                <Input
                  id="badgeColor"
                  value={badgeColor}
                  onChange={(e) => setBadgeColor(e.target.value)}
                  placeholder="e.g. Blue, Green"
                />
              </div>
            </div>
          </FormSection>

          {/* Other */}
          <FormSection title="Other">
            <div className="space-y-2">
              <Label htmlFor="mobileCompatibility">
                Mobile Compatibility
              </Label>
              <Input
                id="mobileCompatibility"
                value={mobileCompatibility}
                onChange={(e) => setMobileCompatibility(e.target.value)}
                placeholder="e.g. Full mobile browser support, iOS/Android apps"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registrationProcess">
                Registration Process
              </Label>
              <Input
                id="registrationProcess"
                value={registrationProcess}
                onChange={(e) => setRegistrationProcess(e.target.value)}
                placeholder="e.g. Quick 2-step registration"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kycProcess">KYC Process</Label>
              <Input
                id="kycProcess"
                value={kycProcess}
                onChange={(e) => setKycProcess(e.target.value)}
                placeholder="e.g. ID + Proof of address required"
              />
            </div>
          </FormSection>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
