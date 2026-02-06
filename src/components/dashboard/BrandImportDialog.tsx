"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface BrandImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (result: { imported: number; skipped: number; errors: number }) => void;
}

const EXAMPLE_JSON = `{
  "baseUrl": "https://example.com",
  "brands": {
    "Brand Name": {
      "slug": "brand-slug",
      "logo": "/media/brand-slug.webp",
      "affiliateUrl": "https://...",
      "rating": 8.5,
      "license": "Curacao",
      "bonus": "100% up to $500",
      "description": "Optional description",
      "pros": ["Pro 1", "Pro 2"],
      "cons": ["Con 1"],
      "yearEstablished": 2020,
      "paymentMethods": ["Visa", "Skrill"],
      "gameProviders": ["NetEnt", "Microgaming"],
      "features": ["Fast Payouts", "VIP"]
    }
  }
}`;

export function BrandImportDialog({
  open,
  onOpenChange,
  onSuccess,
}: BrandImportDialogProps) {
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setImporting(true);

    try {
      const text = await file.text();
      const json = JSON.parse(text);

      const res = await fetch("/api/brands/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });

      const data = await res.json();

      if (res.ok) {
        onSuccess({
          imported: data.imported,
          skipped: data.skipped,
          errors: data.errors?.length || 0,
        });
        onOpenChange(false);
      } else {
        setError(data.error || "Import failed");
      }
    } catch (err) {
      setError("Invalid JSON file");
      console.error(err);
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Brands from JSON</DialogTitle>
          <DialogDescription>
            Upload a JSON file with the following format to bulk import brands.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-zinc-900 p-4 overflow-x-auto">
            <pre className="text-sm text-zinc-100 font-mono">{EXAMPLE_JSON}</pre>
          </div>

          <div className="text-sm text-zinc-600 space-y-2">
            <p><strong>Fields:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-zinc-500">
              <li><code className="text-xs bg-zinc-100 px-1 rounded">baseUrl</code> - Optional. Prepended to relative logo paths</li>
              <li><code className="text-xs bg-zinc-100 px-1 rounded">slug</code> - Required. Becomes the brand ID</li>
              <li><code className="text-xs bg-zinc-100 px-1 rounded">logo</code> - Optional. URL or relative path (auto-detected if baseUrl provided)</li>
              <li><code className="text-xs bg-zinc-100 px-1 rounded">affiliateUrl</code>, <code className="text-xs bg-zinc-100 px-1 rounded">rating</code>, <code className="text-xs bg-zinc-100 px-1 rounded">license</code>, <code className="text-xs bg-zinc-100 px-1 rounded">bonus</code> - Optional defaults</li>
              <li><code className="text-xs bg-zinc-100 px-1 rounded">pros</code>, <code className="text-xs bg-zinc-100 px-1 rounded">cons</code> - Optional arrays of strings</li>
              <li><code className="text-xs bg-zinc-100 px-1 rounded">yearEstablished</code>, <code className="text-xs bg-zinc-100 px-1 rounded">ownerOperator</code>, <code className="text-xs bg-zinc-100 px-1 rounded">minDeposit</code>, <code className="text-xs bg-zinc-100 px-1 rounded">withdrawalTime</code> - Optional brand details</li>
              <li><code className="text-xs bg-zinc-100 px-1 rounded">paymentMethods</code>, <code className="text-xs bg-zinc-100 px-1 rounded">gameProviders</code>, <code className="text-xs bg-zinc-100 px-1 rounded">gameTypes</code>, <code className="text-xs bg-zinc-100 px-1 rounded">currencies</code> - Optional arrays</li>
              <li><code className="text-xs bg-zinc-100 px-1 rounded">features</code> - Optional array (max 3), <code className="text-xs bg-zinc-100 px-1 rounded">badgeText</code>, <code className="text-xs bg-zinc-100 px-1 rounded">badgeColor</code> - Display options</li>
            </ul>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
            >
              {importing ? "Importing..." : "Upload JSON File"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
