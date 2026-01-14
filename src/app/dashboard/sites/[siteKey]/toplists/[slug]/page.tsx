"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ui/image-upload";

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
}

interface Toplist {
  siteKey: string;
  slug: string;
  title: string | null;
  updatedAt: string;
  items: ToplistItem[];
}

function SortableItem({
  item,
  onUpdate,
  onRemove,
}: {
  item: ToplistItem;
  onUpdate: (id: string, field: string, value: string | number | string[] | null) => void;
  onRemove: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [expanded, setExpanded] = useState(false);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg border bg-white p-4 mb-2"
    >
      <div className="flex items-center gap-4">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab text-zinc-400 hover:text-zinc-600"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </button>

        {item.logoOverride || item.brandLogo ? (
          <img
            src={item.logoOverride || item.brandLogo || ""}
            alt={item.brandName}
            className="h-10 w-20 object-contain"
          />
        ) : (
          <div className="h-10 w-20 rounded bg-zinc-200" />
        )}

        <div className="flex-1">
          <p className="font-medium">{item.brandName}</p>
          <p className="text-sm text-zinc-500">{item.brandId}</p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Collapse" : "Edit"}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(item.id)}
          className="text-red-500 hover:text-red-700"
        >
          Remove
        </Button>
      </div>

      {expanded && (
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3 pl-9">
          <div>
            <Label className="text-xs">Bonus Override</Label>
            <Input
              value={item.bonus || ""}
              onChange={(e) => onUpdate(item.id, "bonus", e.target.value || null)}
              placeholder="e.g. 100% up to $500"
            />
          </div>
          <div>
            <Label className="text-xs">Affiliate URL Override</Label>
            <Input
              value={item.affiliateUrl || ""}
              onChange={(e) => onUpdate(item.id, "affiliateUrl", e.target.value || null)}
              placeholder="https://..."
            />
          </div>
          <div>
            <Label className="text-xs">Review URL</Label>
            <Input
              value={item.reviewUrl || ""}
              onChange={(e) => onUpdate(item.id, "reviewUrl", e.target.value || null)}
              placeholder="/reviews/..."
            />
          </div>
          <div>
            <Label className="text-xs">Rating (0-10)</Label>
            <Input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={item.rating ?? ""}
              onChange={(e) =>
                onUpdate(item.id, "rating", e.target.value ? parseFloat(e.target.value) : null)
              }
            />
          </div>
          <div>
            <Label className="text-xs">CTA Text</Label>
            <Input
              value={item.cta || ""}
              onChange={(e) => onUpdate(item.id, "cta", e.target.value || null)}
              placeholder="e.g. Play Now"
            />
          </div>
          <div className="lg:col-span-2">
            <Label className="text-xs">Logo Override</Label>
            <ImageUpload
              value={item.logoOverride || ""}
              onChange={(url) => onUpdate(item.id, "logoOverride", url || null)}
              type="toplist-item"
              identifier={`${item.brandId}-${item.id}`}
            />
          </div>
          <div>
            <Label className="text-xs">Terms Override</Label>
            <Input
              value={item.termsOverride || ""}
              onChange={(e) => onUpdate(item.id, "termsOverride", e.target.value || null)}
              placeholder="e.g. 18+ T&Cs apply"
            />
          </div>
          <div>
            <Label className="text-xs">License Override</Label>
            <Input
              value={item.licenseOverride || ""}
              onChange={(e) => onUpdate(item.id, "licenseOverride", e.target.value || null)}
              placeholder="e.g. MGA, Curacao"
            />
          </div>
          <div className="lg:col-span-3 md:col-span-2">
            <Label className="text-xs">Pros Override (one per line)</Label>
            <Textarea
              value={item.prosOverride?.join("\n") || ""}
              onChange={(e) => {
                const lines = e.target.value
                  .split("\n")
                  .map((l) => l.trim())
                  .filter((l) => l.length > 0);
                onUpdate(item.id, "prosOverride", lines.length > 0 ? lines : null);
              }}
              placeholder="One pro per line"
              rows={2}
            />
          </div>
          <div className="lg:col-span-3 md:col-span-2">
            <Label className="text-xs">Cons Override (one per line)</Label>
            <Textarea
              value={item.consOverride?.join("\n") || ""}
              onChange={(e) => {
                const lines = e.target.value
                  .split("\n")
                  .map((l) => l.trim())
                  .filter((l) => l.length > 0);
                onUpdate(item.id, "consOverride", lines.length > 0 ? lines : null);
              }}
              placeholder="One con per line"
              rows={2}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ToplistEditorPage() {
  const params = useParams();
  const siteKey = params.siteKey as string;
  const slug = params.slug as string;

  const [toplist, setToplist] = useState<Toplist | null>(null);
  const [items, setItems] = useState<ToplistItem[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string>("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function loadData() {
    try {
      const [toplistRes, brandsRes] = await Promise.all([
        fetch(`/api/sites/${siteKey}/toplists/${slug}/items`),
        fetch("/api/brands"),
      ]);

      if (toplistRes.ok) {
        const data = await toplistRes.json();
        setToplist(data);
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

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      setHasChanges(true);
    }
  }

  function handleUpdateItem(id: string, field: string, value: string | number | string[] | null) {
    setItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
    setHasChanges(true);
  }

  function handleRemoveItem(id: string) {
    setItems((items) => items.filter((item) => item.id !== id));
    setHasChanges(true);
  }

  function handleAddBrand() {
    if (!selectedBrand) return;

    const brand = brands.find((b) => b.brandId === selectedBrand);
    if (!brand) return;

    // Check if already in list
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
    setSelectedBrand("");
    setHasChanges(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/sites/${siteKey}/toplists/${slug}/items`, {
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
      });

      if (res.ok) {
        toast.success("Changes saved");
        setHasChanges(false);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to save");
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

  // Filter out brands already in the list
  const availableBrands = brands.filter(
    (b) => !items.some((i) => i.brandId === b.brandId)
  );

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
        <Button onClick={handleSave} disabled={!hasChanges || saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="flex gap-2 mb-6">
        <Select value={selectedBrand} onValueChange={setSelectedBrand}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select a brand to add..." />
          </SelectTrigger>
          <SelectContent>
            {availableBrands.map((brand) => (
              <SelectItem key={brand.brandId} value={brand.brandId}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleAddBrand} disabled={!selectedBrand}>
          Add Brand
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="text-zinc-500">
          No items yet. Add brands from the dropdown above.
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            {items.map((item) => (
              <SortableItem
                key={item.id}
                item={item}
                onUpdate={handleUpdateItem}
                onRemove={handleRemoveItem}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}

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
