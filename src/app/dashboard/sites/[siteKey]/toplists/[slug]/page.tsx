"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ToplistTableBuilder } from "@/components/dashboard/ToplistTableBuilder";

interface ToplistItem {
  id: string;
  brandId: string;
  brandName: string;
  brandLogo: string | null;
  bonus: string | null;
  affiliateUrl: string | null;
  reviewUrl: string | null;
  rating: number | null;
  cta: string | null;
  logoOverride: string | null;
  termsOverride: string | null;
  licenseOverride: string | null;
  prosOverride: string[] | null;
  consOverride: string[] | null;
}

interface Brand {
  brandId: string;
  name: string;
  defaultLogo: string | null;
  defaultBonus: string | null;
  defaultRating: number | null;
  terms: string | null;
  license: string | null;
  pros: string[] | null;
  cons: string[] | null;
  features: string[] | null;
  badgeText: string | null;
  badgeColor: string | null;
  gameProviders: string[] | null;
  gameTypes: string[] | null;
}

interface Toplist {
  siteKey: string;
  slug: string;
  title: string | null;
  columns: string[] | null;
  updatedAt: string;
  items: ToplistItem[];
}

const DEFAULT_COLUMNS = ["name", "bonus", "rating"];

export default function ToplistEditorPage() {
  const params = useParams();
  const siteKey = params.siteKey as string;
  const slug = params.slug as string;

  const [toplist, setToplist] = useState<Toplist | null>(null);
  const [items, setItems] = useState<ToplistItem[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [columns, setColumns] = useState<string[]>(DEFAULT_COLUMNS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  async function loadData() {
    try {
      const [toplistRes, brandsRes] = await Promise.all([
        fetch(`/api/sites/${siteKey}/toplists/${slug}/items`),
        fetch("/api/brands"),
      ]);

      if (toplistRes.ok) {
        const data = await toplistRes.json();
        setToplist(data);
        // Load columns from API or use defaults
        if (Array.isArray(data.columns) && data.columns.length > 0) {
          setColumns(data.columns);
        }
        // Transform items with raw override values
        const itemsWithBrands = data.items.map((item: any, index: number) => ({
          id: `item-${index}`,
          brandId: item.brandId,
          brandName: item.brandName,
          brandLogo: item.brandLogo,
          bonus: item.bonus,
          affiliateUrl: item.affiliateUrl,
          reviewUrl: item.reviewUrl,
          rating: item.rating,
          cta: item.cta,
          logoOverride: item.logoOverride,
          termsOverride: item.termsOverride,
          licenseOverride: item.licenseOverride,
          prosOverride: item.prosOverride,
          consOverride: item.consOverride,
        }));
        setItems(itemsWithBrands);
      }

      if (brandsRes.ok) {
        setBrands(await brandsRes.json());
      }
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [siteKey, slug]);

  function handleRemoveItem(id: string) {
    setItems((items) => items.filter((item) => item.id !== id));
    setHasChanges(true);
  }

  function handleAddBrand(brandId: string) {
    const brand = brands.find((b) => b.brandId === brandId);
    if (!brand) return;

    if (items.some((i) => i.brandId === brand.brandId)) {
      toast.error("Brand already in list");
      return;
    }

    const newItem: ToplistItem = {
      id: `item-${Date.now()}`,
      brandId: brand.brandId,
      brandName: brand.name,
      brandLogo: brand.defaultLogo,
      bonus: null,
      affiliateUrl: null,
      reviewUrl: null,
      rating: null,
      cta: null,
      logoOverride: null,
      termsOverride: null,
      licenseOverride: null,
      prosOverride: null,
      consOverride: null,
    };

    setItems([...items, newItem]);
    setHasChanges(true);
  }

  function handleColumnsChange(newColumns: string[]) {
    setColumns(newColumns);
    setHasChanges(true);
  }

  function handleReorderItems(newItems: ToplistItem[]) {
    setItems(newItems);
    setHasChanges(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      // Save columns and items in parallel
      const [columnsRes, itemsRes] = await Promise.all([
        fetch(`/api/sites/${siteKey}/toplists/${slug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ columns }),
        }),
        fetch(`/api/sites/${siteKey}/toplists/${slug}/items`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map((item) => ({
              brandId: item.brandId,
              bonus: item.bonus,
              affiliateUrl: item.affiliateUrl,
              reviewUrl: item.reviewUrl,
              rating: item.rating,
              cta: item.cta,
              logoOverride: item.logoOverride,
              termsOverride: item.termsOverride,
              licenseOverride: item.licenseOverride,
              prosOverride: item.prosOverride,
              consOverride: item.consOverride,
            })),
          }),
        }),
      ]);

      if (columnsRes.ok && itemsRes.ok) {
        toast.success("Changes saved");
        setHasChanges(false);
      } else {
        const errData = !columnsRes.ok
          ? await columnsRes.json()
          : await itemsRes.json();
        toast.error(errData.error || "Failed to save");
      }
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-zinc-500">Loading...</div>;
  }

  if (!toplist) {
    return <div className="text-zinc-500">Toplist not found</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/dashboard/sites/${siteKey}`}
          className="text-sm text-zinc-500 hover:text-zinc-900"
        >
          ← Back to Site
        </Link>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">
            {toplist.title || toplist.slug}
          </h1>
          <p className="text-zinc-500">/{toplist.slug}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleSave} disabled={!hasChanges || saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <ToplistTableBuilder
        items={items}
        brands={brands}
        columns={columns}
        onColumnsChange={handleColumnsChange}
        onAddBrand={(brandId) => handleAddBrand(brandId)}
        onRemoveBrand={handleRemoveItem}
        onReorderItems={handleReorderItems}
      />

      {hasChanges && (
        <div className="fixed bottom-6 right-6">
          <Button onClick={handleSave} disabled={saving} size="lg">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      )}
    </div>
  );
}
