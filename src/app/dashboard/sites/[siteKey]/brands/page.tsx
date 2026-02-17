"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  SiteBrandEditor,
  SiteBrandFormState,
  SiteBrandApiData,
  INITIAL_SITE_BRAND_STATE,
  apiToSiteBrandForm,
  getSiteBrandPayload,
} from "@/components/dashboard/SiteBrandEditor";

interface SiteBrand {
  siteKey: string;
  brandId: string;
  brandName: string;
  brandLogo: string | null;
  bonus: string | null;
  rating: number | null;
  affiliateUrl: string | null;
}

interface Brand {
  brandId: string;
  name: string;
  defaultLogo: string | null;
}

export default function SiteBrandsPage() {
  const params = useParams();
  const siteKey = params.siteKey as string;

  const [siteBrands, setSiteBrands] = useState<SiteBrand[]>([]);
  const [allBrands, setAllBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [brandSearch, setBrandSearch] = useState("");

  // Create-new-brand state (inside add dialog)
  const [creating, setCreating] = useState(false);
  const [newBrandId, setNewBrandId] = useState("");
  const [newBrandName, setNewBrandName] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  // Edit modal state
  const [inlineUrls, setInlineUrls] = useState<Record<string, string>>({});
  const [editBrandId, setEditBrandId] = useState<string | null>(null);
  const [editBrandName, setEditBrandName] = useState("");
  const [editForm, setEditForm] = useState<SiteBrandFormState>(INITIAL_SITE_BRAND_STATE);
  const [editLoading, setEditLoading] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  async function loadData() {
    try {
      const [sbRes, brandsRes] = await Promise.all([
        fetch(`/api/sites/${siteKey}/brands`),
        fetch("/api/brands"),
      ]);

      if (sbRes.ok) {
        setSiteBrands(await sbRes.json());
      }
      if (brandsRes.ok) {
        setAllBrands(await brandsRes.json());
      }
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [siteKey]);

  async function handleAddBrand(brandId: string) {
    try {
      const res = await fetch(`/api/sites/${siteKey}/brands`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId }),
      });

      if (res.ok) {
        toast.success("Brand added to site");
        setAddDialogOpen(false);
        loadData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to add brand");
      }
    } catch {
      toast.error("Failed to add brand");
    }
  }

  async function handleCreateAndAdd() {
    if (!newBrandId.trim() || !newBrandName.trim()) return;
    setCreateLoading(true);
    try {
      const createRes = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId: newBrandId.trim(), name: newBrandName.trim() }),
      });
      if (!createRes.ok) {
        const data = await createRes.json();
        toast.error(data.error || "Failed to create brand");
        return;
      }

      const addRes = await fetch(`/api/sites/${siteKey}/brands`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId: newBrandId.trim() }),
      });
      if (addRes.ok) {
        toast.success("Brand created and added to site");
        setAddDialogOpen(false);
        loadData();
      } else {
        const data = await addRes.json();
        toast.error(data.error || "Brand created but failed to add to site");
      }
    } catch {
      toast.error("Failed to create brand");
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleRemoveBrand(brandId: string) {
    if (!confirm("Remove this brand from the site?")) return;

    try {
      const res = await fetch(`/api/sites/${siteKey}/brands/${brandId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Brand removed from site");
        loadData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to remove brand");
      }
    } catch {
      toast.error("Failed to remove brand");
    }
  }

  async function saveInlineUrl(brandId: string) {
    const newUrl = inlineUrls[brandId];
    if (newUrl === undefined) return;
    const existing = siteBrands.find((sb) => sb.brandId === brandId);
    if (newUrl === (existing?.affiliateUrl ?? "")) return;

    try {
      const res = await fetch(`/api/sites/${siteKey}/brands/${brandId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ affiliateUrl: newUrl || null }),
      });
      if (res.ok) {
        toast.success("Affiliate URL saved");
        loadData();
      } else {
        toast.error("Failed to save URL");
      }
    } catch {
      toast.error("Failed to save URL");
    }
  }

  async function openEditModal(brandId: string, brandName: string) {
    setEditBrandId(brandId);
    setEditBrandName(brandName);
    setEditForm(INITIAL_SITE_BRAND_STATE);
    setEditLoading(true);

    try {
      const res = await fetch(`/api/sites/${siteKey}/brands/${brandId}`);
      if (res.ok) {
        const data: SiteBrandApiData = await res.json();
        setEditForm(apiToSiteBrandForm(data));
      } else {
        toast.error("Failed to load brand details");
        setEditBrandId(null);
      }
    } catch {
      toast.error("Failed to load brand details");
      setEditBrandId(null);
    } finally {
      setEditLoading(false);
    }
  }

  function updateEditField<K extends keyof SiteBrandFormState>(
    field: K,
    value: SiteBrandFormState[K]
  ) {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleEditSave() {
    if (!editBrandId) return;
    setEditSaving(true);

    try {
      const res = await fetch(`/api/sites/${siteKey}/brands/${editBrandId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(getSiteBrandPayload(editForm)),
      });

      if (res.ok) {
        toast.success("Brand updated");
        setEditBrandId(null);
        loadData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update brand");
      }
    } catch {
      toast.error("Failed to update brand");
    } finally {
      setEditSaving(false);
    }
  }

  const filteredBrands = siteBrands.filter((sb) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      sb.brandName.toLowerCase().includes(q) ||
      sb.brandId.toLowerCase().includes(q)
    );
  });

  // Brands not yet associated with this site
  const existingBrandIds = new Set(siteBrands.map((sb) => sb.brandId));
  const availableBrands = allBrands.filter(
    (b) =>
      !existingBrandIds.has(b.brandId) &&
      (!brandSearch.trim() ||
        b.name.toLowerCase().includes(brandSearch.toLowerCase()) ||
        b.brandId.toLowerCase().includes(brandSearch.toLowerCase()))
  );

  if (loading) {
    return <div className="text-zinc-500">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/dashboard/sites/${siteKey}`}
          className="text-sm text-zinc-500 hover:text-zinc-900"
        >
          &larr; Back to Site
        </Link>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Site Brands</h1>
          <p className="text-zinc-500">
            {siteBrands.length} brand{siteBrands.length !== 1 ? "s" : ""}{" "}
            associated with this site
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>Add Brand</Button>
      </div>

      {siteBrands.length > 0 && (
        <div className="mb-4">
          <Input
            placeholder="Search brands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
        </div>
      )}

      {filteredBrands.length === 0 ? (
        <div className="text-zinc-500">
          {siteBrands.length === 0
            ? "No brands associated yet. Add one to get started."
            : `No brands matching "${search}"`}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Logo</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Bonus</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Affiliate URL</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBrands.map((sb) => (
              <TableRow
                key={sb.brandId}
                className="cursor-pointer hover:bg-zinc-50"
                onClick={() => openEditModal(sb.brandId, sb.brandName)}
              >
                <TableCell>
                  {sb.brandLogo ? (
                    <img
                      src={sb.brandLogo}
                      alt={sb.brandName}
                      className="h-8 w-16 object-contain"
                    />
                  ) : (
                    <div className="h-8 w-16 bg-zinc-100 rounded" />
                  )}
                </TableCell>
                <TableCell>
                  <span className="font-medium text-zinc-900">
                    {sb.brandName}
                  </span>
                  <div className="text-xs text-zinc-400 font-mono">
                    {sb.brandId}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-zinc-600">
                  {sb.bonus || "—"}
                </TableCell>
                <TableCell className="text-sm text-zinc-600">
                  {sb.rating != null ? sb.rating : "—"}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Input
                    className="h-8 text-xs font-mono"
                    placeholder="https://..."
                    value={inlineUrls[sb.brandId] ?? sb.affiliateUrl ?? ""}
                    onChange={(e) =>
                      setInlineUrls((prev) => ({ ...prev, [sb.brandId]: e.target.value }))
                    }
                    onBlur={() => saveInlineUrl(sb.brandId)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.currentTarget.blur();
                      }
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveBrand(sb.brandId);
                    }}
                  >
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={addDialogOpen} onOpenChange={(open) => {
        setAddDialogOpen(open);
        if (!open) {
          setCreating(false);
          setNewBrandId("");
          setNewBrandName("");
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Brand to Site</DialogTitle>
          </DialogHeader>
          {creating ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-brand-id">Brand ID</Label>
                <Input
                  id="new-brand-id"
                  placeholder="e.g. my-brand"
                  value={newBrandId}
                  onChange={(e) => setNewBrandId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-brand-name">Brand Name</Label>
                <Input
                  id="new-brand-name"
                  placeholder="e.g. My Brand"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                />
              </div>
              <DialogFooter className="flex items-center justify-between sm:justify-between">
                <button
                  type="button"
                  className="text-sm text-zinc-500 hover:text-zinc-900"
                  onClick={() => setCreating(false)}
                >
                  &larr; Back to list
                </button>
                <Button
                  onClick={handleCreateAndAdd}
                  disabled={createLoading || !newBrandId.trim() || !newBrandName.trim()}
                >
                  {createLoading ? "Creating..." : "Create & Add"}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Search brands</Label>
                  <Input
                    placeholder="Search by name or ID..."
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                  />
                </div>
                <div className="max-h-64 overflow-y-auto space-y-1">
                  {availableBrands.length === 0 ? (
                    <p className="text-sm text-zinc-500 py-2">
                      No available brands found
                    </p>
                  ) : (
                    availableBrands.slice(0, 20).map((brand) => (
                      <button
                        key={brand.brandId}
                        onClick={() => handleAddBrand(brand.brandId)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-zinc-100 text-left"
                      >
                        {brand.defaultLogo ? (
                          <img
                            src={brand.defaultLogo}
                            alt={brand.name}
                            className="h-6 w-12 object-contain"
                          />
                        ) : (
                          <div className="h-6 w-12 bg-zinc-100 rounded" />
                        )}
                        <div>
                          <div className="text-sm font-medium">{brand.name}</div>
                          <div className="text-xs text-zinc-400 font-mono">
                            {brand.brandId}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                  {availableBrands.length > 20 && (
                    <p className="text-xs text-zinc-400 py-1 text-center">
                      Showing 20 of {availableBrands.length} — refine your search
                    </p>
                  )}
                </div>
              </div>
              <div className="border-t pt-3">
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  onClick={() => setCreating(true)}
                >
                  + Create new brand
                </button>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                  Cancel
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={editBrandId !== null} onOpenChange={(open) => { if (!open) setEditBrandId(null); }}>
        <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit — {editBrandName}</DialogTitle>
          </DialogHeader>
          {editLoading ? (
            <div className="py-8 text-center text-zinc-500">Loading...</div>
          ) : (
            <SiteBrandEditor
              brandId={editBrandId ?? ""}
              siteKey={siteKey}
              state={editForm}
              updateField={updateEditField}
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditBrandId(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditSave} disabled={editLoading || editSaving}>
              {editSaving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
