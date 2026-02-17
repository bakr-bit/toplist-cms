"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BrandEditor } from "@/components/dashboard/BrandEditor";
import { useBrandForm, BrandApiData } from "@/lib/use-brand-form";

export default function BrandEditorPage() {
  const params = useParams();
  const brandId = params.brandId as string;
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.replace("/dashboard/sites");
    }
  }, [status, session, router]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const { state, updateField, loadBrand, resetForm, hasChanges, markSaved, getSubmitPayload } =
    useBrandForm();

  async function fetchBrand() {
    try {
      const res = await fetch(`/api/brands/${brandId}`);
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      if (res.ok) {
        const data: BrandApiData = await res.json();
        loadBrand(data);
      }
    } catch {
      toast.error("Failed to load brand");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBrand();
  }, [brandId]);

  useEffect(() => {
    if (!hasChanges) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasChanges]);

  async function handleSave() {
    setSaving(true);
    try {
      const payload = getSubmitPayload();
      const res = await fetch(`/api/brands/${brandId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        markSaved();
        toast.success("Brand saved");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to save brand");
      }
    } catch {
      toast.error("Failed to save brand");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-zinc-500">Loading...</div>;
  }

  if (notFound) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard/brands"
          className="text-sm text-zinc-500 hover:text-zinc-900"
        >
          &larr; Back to Brands
        </Link>
        <div className="text-zinc-500">Brand not found</div>
      </div>
    );
  }

  return (
    <div className="pb-16">
      <div className="mb-6">
        <Link
          href="/dashboard/brands"
          className="text-sm text-zinc-500 hover:text-zinc-900"
        >
          &larr; Back to Brands
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">
          {state.name || brandId}
        </h1>
        <p className="text-zinc-500 font-mono text-sm">{brandId}</p>
      </div>

      <BrandEditor
        brandId={brandId}
        state={state}
        updateField={updateField}
      />

      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 bg-amber-50 border-t border-amber-200 px-6 py-3 flex items-center justify-between z-50">
          <span className="text-sm text-amber-800 font-medium">
            You have unsaved changes
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetForm}
            >
              Discard
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
