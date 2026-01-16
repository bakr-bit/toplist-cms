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

interface ToplistImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  siteKey: string;
  onSuccess: (result: { imported: number; skipped: number; warnings: number; errors: number }) => void;
}

const EXAMPLE_JSON = `{
  "items": {
    "brand-slug": {
      "slug": "brand-slug",
      "bonus": "Site-specific bonus override",
      "affiliateUrl": "https://site-specific-link.com"
    }
  },
  "toplists": {
    "homepage-toplist": {
      "items": ["brand-1", "brand-2", "brand-3"]
    },
    "sidebar-toplist": {
      "items": ["brand-2", "brand-1"]
    }
  },
  "pageMapping": {
    "/": ["homepage-toplist"],
    "/reviews": ["sidebar-toplist"],
    "/bonuses": ["homepage-toplist", "sidebar-toplist"]
  }
}`;

export function ToplistImportDialog({
  open,
  onOpenChange,
  siteKey,
  onSuccess,
}: ToplistImportDialogProps) {
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

      const res = await fetch(`/api/sites/${siteKey}/toplists/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });

      const data = await res.json();

      if (res.ok) {
        onSuccess({
          imported: data.imported,
          skipped: data.skipped,
          warnings: data.warnings?.length || 0,
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
          <DialogTitle>Import Toplists from JSON</DialogTitle>
          <DialogDescription>
            Upload a JSON file with the following format to bulk import toplists.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-zinc-900 p-4 overflow-x-auto">
            <pre className="text-sm text-zinc-100 font-mono">{EXAMPLE_JSON}</pre>
          </div>

          <div className="text-sm text-zinc-600 space-y-2">
            <p><strong>Structure:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-zinc-500">
              <li><code className="text-xs bg-zinc-100 px-1 rounded">items</code> - Brand overrides (bonus, affiliateUrl) for this site</li>
              <li><code className="text-xs bg-zinc-100 px-1 rounded">toplists</code> - Toplist definitions with ordered brand arrays</li>
              <li><code className="text-xs bg-zinc-100 px-1 rounded">pageMapping</code> - Which pages use which toplists</li>
            </ul>
            <p className="text-zinc-400 text-xs mt-2">
              Note: Brands must exist before importing toplists. Import brands first if needed.
            </p>
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
