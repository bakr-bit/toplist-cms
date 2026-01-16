"use client";

import { useState } from "react";
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

interface SiteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function SiteDialog({ open, onOpenChange, onSuccess }: SiteDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [domain, setDomain] = useState("");
  const [name, setName] = useState("");
  const [geo, setGeo] = useState("");
  const [keywords, setKeywords] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Convert keywords textarea to array
      const keywordsArray = keywords
        .split("\n")
        .map((k) => k.trim())
        .filter((k) => k.length > 0);

      const res = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: domain.toLowerCase(),
          name,
          geo: geo || null,
          keywords: keywordsArray.length > 0 ? keywordsArray : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create site");
      }

      setDomain("");
      setName("");
      setGeo("");
      setKeywords("");
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Site</DialogTitle>
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
            />
            <p className="text-xs text-zinc-500">
              Site key will be auto-generated (dots → dashes)
            </p>
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
            <Label htmlFor="geo">Target GEO</Label>
            <Input
              id="geo"
              value={geo}
              onChange={(e) => setGeo(e.target.value)}
              placeholder="e.g. Romania, UK, US"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="keywords">Target Keywords</Label>
            <Textarea
              id="keywords"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="One keyword per line"
              rows={3}
            />
            <p className="text-xs text-zinc-500">Enter one keyword per line</p>
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
              {loading ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
