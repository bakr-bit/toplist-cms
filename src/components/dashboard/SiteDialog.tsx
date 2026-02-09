"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, X } from "lucide-react";

interface Serp {
  keyword: string;
  geo: string;
}

interface SiteData {
  siteKey: string;
  domain: string;
  name: string;
  serps: Serp[] | null;
}

interface SiteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  site?: SiteData | null;
}

export function SiteDialog({ open, onOpenChange, onSuccess, site }: SiteDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [domain, setDomain] = useState("");
  const [name, setName] = useState("");
  const [serps, setSerps] = useState<Serp[]>([]);

  const isEditing = !!site;

  useEffect(() => {
    if (site) {
      setDomain(site.domain);
      setName(site.name);
      setSerps(site.serps ?? []);
    } else {
      setDomain("");
      setName("");
      setSerps([]);
    }
    setError("");
  }, [site, open]);

  function addSerp() {
    setSerps([...serps, { keyword: "", geo: "" }]);
  }

  function removeSerp(index: number) {
    setSerps(serps.filter((_, i) => i !== index));
  }

  function updateSerp(index: number, field: keyof Serp, value: string) {
    const updated = [...serps];
    updated[index] = { ...updated[index], [field]: value };
    setSerps(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const validSerps = serps
        .filter((s) => s.keyword.trim() && s.geo.trim())
        .map((s) => ({
          keyword: s.keyword.trim(),
          geo: s.geo.trim().toUpperCase(),
        }));

      if (isEditing) {
        const res = await fetch(`/api/sites/${site!.siteKey}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            serps: validSerps.length > 0 ? validSerps : null,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to update site");
        }
      } else {
        const res = await fetch("/api/sites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            domain: domain.toLowerCase(),
            name,
            serps: validSerps.length > 0 ? validSerps : null,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to create site");
        }
      }

      setDomain("");
      setName("");
      setSerps([]);
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Site" : "Add Site"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="domain">Domain</Label>
            <Input
              id="domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g. cazinou.io"
              required
              disabled={isEditing}
              className={isEditing ? "bg-zinc-100 text-zinc-500" : ""}
            />
            {!isEditing && (
              <p className="text-xs text-zinc-500">
                Site key will be auto-generated (dots to dashes)
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cazinou.io"
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Target SERPs</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSerp}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add SERP
              </Button>
            </div>
            {serps.length === 0 ? (
              <p className="text-sm text-zinc-500">
                No SERPs added. Click &quot;Add SERP&quot; to track keyword rankings.
              </p>
            ) : (
              <div className="space-y-2">
                {serps.map((serp, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <Input
                        value={serp.keyword}
                        onChange={(e) =>
                          updateSerp(index, "keyword", e.target.value)
                        }
                        placeholder="Keyword"
                      />
                    </div>
                    <div className="w-20">
                      <Input
                        value={serp.geo}
                        onChange={(e) =>
                          updateSerp(index, "geo", e.target.value)
                        }
                        placeholder="GEO"
                        maxLength={2}
                        className="uppercase"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSerp(index)}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <p className="text-xs text-zinc-500">
                  GEO: 2-letter country code (US, GB, RO, etc.)
                </p>
              </div>
            )}
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
              {loading ? (isEditing ? "Saving..." : "Creating...") : (isEditing ? "Save" : "Create")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
