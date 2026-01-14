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
}

interface BrandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand?: Brand | null;
  onSuccess: () => void;
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

  const [brandId, setBrandId] = useState(brand?.brandId || "");
  const [name, setName] = useState(brand?.name || "");
  const [defaultLogo, setDefaultLogo] = useState(brand?.defaultLogo || "");
  const [website, setWebsite] = useState(brand?.website || "");
  const [defaultBonus, setDefaultBonus] = useState(brand?.defaultBonus || "");
  const [defaultAffiliateUrl, setDefaultAffiliateUrl] = useState(
    brand?.defaultAffiliateUrl || ""
  );
  const [defaultRating, setDefaultRating] = useState<string>(
    brand?.defaultRating?.toString() || ""
  );
  const [terms, setTerms] = useState(brand?.terms || "");
  const [license, setLicense] = useState(brand?.license || "");
  const [description, setDescription] = useState(brand?.description || "");
  const [pros, setPros] = useState(brand?.pros?.join("\n") || "");
  const [cons, setCons] = useState(brand?.cons?.join("\n") || "");

  // Reset form when dialog opens with new brand
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
      setPros(brand?.pros?.join("\n") || "");
      setCons(brand?.cons?.join("\n") || "");
      setError("");
    }
  }, [open, brand]);

  // Helper to convert textarea value to array
  const textToArray = (text: string): string[] | null => {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    return lines.length > 0 ? lines : null;
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
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Brand" : "Add Brand"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}
          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="brandId">Brand ID</Label>
              <Input
                id="brandId"
                value={brandId}
                onChange={(e) =>
                  setBrandId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))
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
            <Label htmlFor="terms">Terms & Conditions</Label>
            <Input
              id="terms"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="e.g. 18+ T&Cs apply"
            />
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
