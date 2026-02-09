"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BrandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function BrandDialog({
  open,
  onOpenChange,
  onSuccess,
}: BrandDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [brandId, setBrandId] = useState("");
  const [name, setName] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId, name }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create brand");
      }

      onSuccess();
      onOpenChange(false);
      router.push(`/dashboard/brands/${brandId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          setBrandId("");
          setName("");
          setError("");
        }
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Brand</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="brandId">Brand ID</Label>
            <Input
              id="brandId"
              value={brandId}
              onChange={(e) =>
                setBrandId(
                  e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-")
                )
              }
              placeholder="e.g. velobet-casino"
              required
            />
            <p className="text-xs text-zinc-500">
              Lowercase letters, numbers, and dashes only
            </p>
          </div>

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

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Brand"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
