"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BrandDialog } from "@/components/dashboard/BrandDialog";
import { toast } from "sonner";

interface Brand {
  brandId: string;
  name: string;
  defaultLogo: string | null;
  website: string | null;
  defaultBonus: string | null;
  defaultAffiliateUrl: string | null;
  terms: string | null;
  license: string | null;
  pros: string[] | null;
  cons: string[] | null;
  usageCount: number;
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  async function loadBrands() {
    try {
      const res = await fetch("/api/brands");
      if (res.ok) {
        setBrands(await res.json());
      }
    } catch (err) {
      toast.error("Failed to load brands");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBrands();
  }, []);

  function handleAdd() {
    setEditingBrand(null);
    setDialogOpen(true);
  }

  function handleEdit(brand: Brand) {
    setEditingBrand(brand);
    setDialogOpen(true);
  }

  async function handleDelete(brandId: string) {
    if (!confirm("Are you sure you want to delete this brand?")) return;

    try {
      const res = await fetch(`/api/brands/${brandId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Brand deleted");
        loadBrands();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete brand");
      }
    } catch {
      toast.error("Failed to delete brand");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Brands</h1>
        <Button onClick={handleAdd}>Add Brand</Button>
      </div>

      {loading ? (
        <div className="text-zinc-500">Loading...</div>
      ) : brands.length === 0 ? (
        <div className="text-zinc-500">No brands yet. Create your first one!</div>
      ) : (
        <div className="rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Logo</TableHead>
                <TableHead>Brand ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map((brand) => (
                <TableRow key={brand.brandId}>
                  <TableCell>
                    {brand.defaultLogo ? (
                      <img
                        src={brand.defaultLogo}
                        alt={brand.name}
                        className="h-8 w-auto object-contain"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded bg-zinc-200" />
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {brand.brandId}
                  </TableCell>
                  <TableCell className="font-medium">{brand.name}</TableCell>
                  <TableCell>{brand.usageCount} toplists</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(brand)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(brand.brandId)}
                        disabled={brand.usageCount > 0}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <BrandDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        brand={editingBrand}
        onSuccess={() => {
          loadBrands();
          toast.success(editingBrand ? "Brand updated" : "Brand created");
        }}
      />
    </div>
  );
}
