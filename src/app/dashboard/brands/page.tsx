"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BrandDialog } from "@/components/dashboard/BrandDialog";
import { BrandImportDialog } from "@/components/dashboard/BrandImportDialog";
import { toast } from "sonner";
import { getPaymentMethodName } from "@/lib/payment-methods";
import { getGameTypeName } from "@/lib/game-types";
import { getGameProviderName } from "@/lib/game-providers";
import { getCountryName, getLanguageName } from "@/lib/countries";

interface Brand {
  brandId: string;
  name: string;
  defaultLogo: string | null;
  website: string | null;
  usageCount: number;
}

interface BrandDetail {
  brandId: string;
  name: string;
  defaultLogo: string | null;
  website: string | null;
  license: string | null;
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
  sportsBetting: boolean | null;
  cryptoCasino: boolean | null;
  vpnAllowed: boolean | null;
  kycRequired: boolean | null;
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
  usageCount: number;
}

function BoolBadge({ value }: { value: boolean | null }) {
  if (value === null) return <span className="text-zinc-400">-</span>;
  return value ? (
    <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Yes</span>
  ) : (
    <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">No</span>
  );
}

function TagList({ items, resolver }: { items: string[] | null; resolver?: (id: string) => string }) {
  if (!items || items.length === 0) return <span className="text-zinc-400">-</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item) => (
        <span key={item} className="text-xs bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded">
          {resolver ? resolver(item) : item}
        </span>
      ))}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start py-1.5 border-b border-zinc-100 last:border-0">
      <span className="text-sm text-zinc-500 shrink-0 w-40">{label}</span>
      <span className="text-sm text-zinc-900 text-right">{value || <span className="text-zinc-400">-</span>}</span>
    </div>
  );
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [detailBrand, setDetailBrand] = useState<BrandDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

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

  async function handleRowClick(brandId: string) {
    setDetailLoading(true);
    setDetailBrand(null);
    try {
      const res = await fetch(`/api/brands/${brandId}`);
      if (res.ok) {
        setDetailBrand(await res.json());
      } else {
        toast.error("Failed to load brand details");
      }
    } catch {
      toast.error("Failed to load brand details");
    } finally {
      setDetailLoading(false);
    }
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
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setImportDialogOpen(true)}
          >
            Import JSON
          </Button>
          <Button onClick={() => setDialogOpen(true)}>Add Brand</Button>
        </div>
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
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map((brand) => (
                <TableRow
                  key={brand.brandId}
                  className="cursor-pointer"
                  onClick={() => handleRowClick(brand.brandId)}
                >
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
                  <TableCell>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <Link href={`/dashboard/brands/${brand.brandId}`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
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

      {/* Brand detail modal */}
      <Dialog open={detailBrand !== null || detailLoading} onOpenChange={(open) => { if (!open) setDetailBrand(null); }}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          {detailLoading ? (
            <div className="py-8 text-center text-zinc-500">
              <DialogTitle className="sr-only">Loading brand</DialogTitle>
              Loading...
            </div>
          ) : detailBrand && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  {detailBrand.defaultLogo && (
                    <img
                      src={detailBrand.defaultLogo}
                      alt={detailBrand.name}
                      className="h-12 w-auto object-contain"
                    />
                  )}
                  <div>
                    <DialogTitle className="text-xl">{detailBrand.name}</DialogTitle>
                    <p className="text-sm text-zinc-500 font-mono">{detailBrand.brandId}</p>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Core */}
                <section>
                  <h3 className="text-sm font-semibold text-zinc-900 mb-2">General</h3>
                  <div className="bg-zinc-50 rounded-lg px-4 py-2">
                    <InfoRow label="Website" value={
                      detailBrand.website ? (
                        <a href={detailBrand.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {detailBrand.website}
                        </a>
                      ) : null
                    } />
                    <InfoRow label="Year Established" value={detailBrand.yearEstablished} />
                    <InfoRow label="Owner / Operator" value={detailBrand.ownerOperator} />
                    <InfoRow label="License" value={detailBrand.license} />
                    <InfoRow label="Usage" value={`${detailBrand.usageCount} toplists`} />
                  </div>
                </section>

                {/* Flags */}
                <section>
                  <h3 className="text-sm font-semibold text-zinc-900 mb-2">Features</h3>
                  <div className="bg-zinc-50 rounded-lg px-4 py-2">
                    <InfoRow label="Sports Betting" value={<BoolBadge value={detailBrand.sportsBetting} />} />
                    <InfoRow label="Crypto" value={<BoolBadge value={detailBrand.cryptoCasino} />} />
                    <InfoRow label="VPN Allowed" value={<BoolBadge value={detailBrand.vpnAllowed} />} />
                    <InfoRow label="KYC Required" value={<BoolBadge value={detailBrand.kycRequired} />} />
                  </div>
                </section>

                {/* Payment */}
                <section>
                  <h3 className="text-sm font-semibold text-zinc-900 mb-2">Payment</h3>
                  <div className="bg-zinc-50 rounded-lg px-4 py-2">
                    <InfoRow label="Currencies" value={<TagList items={detailBrand.currencies} />} />
                    <InfoRow label="Payment Methods" value={<TagList items={detailBrand.paymentMethods} resolver={getPaymentMethodName} />} />
                    <InfoRow label="Min Deposit" value={detailBrand.minDeposit} />
                    <InfoRow label="Min Withdrawal" value={detailBrand.minWithdrawal} />
                    <InfoRow label="Max Withdrawal" value={detailBrand.maxWithdrawal} />
                    <InfoRow label="Withdrawal Time" value={detailBrand.withdrawalTime} />
                  </div>
                </section>

                {/* Games */}
                <section>
                  <h3 className="text-sm font-semibold text-zinc-900 mb-2">Games</h3>
                  <div className="bg-zinc-50 rounded-lg px-4 py-2">
                    <InfoRow label="Game Types" value={<TagList items={detailBrand.gameTypes} resolver={getGameTypeName} />} />
                    <InfoRow label="Game Providers" value={<TagList items={detailBrand.gameProviders} resolver={getGameProviderName} />} />
                    <InfoRow label="Total Games" value={detailBrand.totalGames} />
                    <InfoRow label="Exclusive Games" value={detailBrand.exclusiveGames} />
                  </div>
                </section>

                {/* Geo & Languages */}
                <section>
                  <h3 className="text-sm font-semibold text-zinc-900 mb-2">Geo & Languages</h3>
                  <div className="bg-zinc-50 rounded-lg px-4 py-2">
                    <InfoRow label="Languages" value={<TagList items={detailBrand.languages} resolver={getLanguageName} />} />
                    <InfoRow label="Available Countries" value={<TagList items={detailBrand.availableCountries} resolver={getCountryName} />} />
                    <InfoRow label="Restricted Countries" value={<TagList items={detailBrand.restrictedCountries} resolver={getCountryName} />} />
                    <InfoRow label="Support Languages" value={<TagList items={detailBrand.supportLanguages} resolver={getLanguageName} />} />
                  </div>
                </section>

                {/* Support & Other */}
                <section>
                  <h3 className="text-sm font-semibold text-zinc-900 mb-2">Support & Other</h3>
                  <div className="bg-zinc-50 rounded-lg px-4 py-2">
                    <InfoRow label="Support Contacts" value={detailBrand.supportContacts} />
                    <InfoRow label="Support Hours" value={detailBrand.supportHours} />
                    <InfoRow label="Mobile" value={detailBrand.mobileCompatibility} />
                    <InfoRow label="Registration" value={detailBrand.registrationProcess} />
                    <InfoRow label="KYC Process" value={detailBrand.kycProcess} />
                  </div>
                </section>
              </div>

              <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                <Link href={`/dashboard/brands/${detailBrand.brandId}`}>
                  <Button size="sm">Edit Brand</Button>
                </Link>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <BrandDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => {
          loadBrands();
          toast.success("Brand created");
        }}
      />

      <BrandImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onSuccess={(result) => {
          loadBrands();
          toast.success(
            `Imported ${result.imported} brands, skipped ${result.skipped} duplicates`
          );
          if (result.errors > 0) {
            toast.error(`${result.errors} brands failed to import`);
          }
        }}
      />
    </div>
  );
}
