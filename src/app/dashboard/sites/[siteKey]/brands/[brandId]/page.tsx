"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  SiteBrandEditor,
  SiteBrandFormState,
  SiteBrandApiData,
  INITIAL_SITE_BRAND_STATE,
  apiToSiteBrandForm,
  getSiteBrandPayload,
} from "@/components/dashboard/SiteBrandEditor";

export default function SiteBrandEditorPage() {
  const params = useParams();
  const siteKey = params.siteKey as string;
  const brandId = params.brandId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [brandName, setBrandName] = useState("");
  const [state, setState] = useState<SiteBrandFormState>(INITIAL_SITE_BRAND_STATE);
  const savedRef = useRef<string>("");

  const updateField = useCallback(
    <K extends keyof SiteBrandFormState>(field: K, value: SiteBrandFormState[K]) => {
      setState((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const hasChanges = JSON.stringify(state) !== savedRef.current;

  async function fetchSiteBrand() {
    try {
      const res = await fetch(`/api/sites/${siteKey}/brands/${brandId}`);
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      if (res.ok) {
        const data: SiteBrandApiData = await res.json();
        setBrandName(data.brandName);
        const formState = apiToSiteBrandForm(data);
        setState(formState);
        savedRef.current = JSON.stringify(formState);
      }
    } catch {
      toast.error("Failed to load brand data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSiteBrand();
  }, [siteKey, brandId]);

  useEffect(() => {
    if (!hasChanges) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasChanges]);

  function handleReset() {
    if (savedRef.current) {
      setState(JSON.parse(savedRef.current));
    } else {
      setState(INITIAL_SITE_BRAND_STATE);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = getSiteBrandPayload(state);
      const res = await fetch(`/api/sites/${siteKey}/brands/${brandId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        savedRef.current = JSON.stringify(state);
        toast.success("Brand deal data saved");
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

  if (notFound) {
    return (
      <div className="space-y-4">
        <Link
          href={`/dashboard/sites/${siteKey}/brands`}
          className="text-sm text-zinc-500 hover:text-zinc-900"
        >
          &larr; Back to Brands
        </Link>
        <div className="text-zinc-500">Brand not found for this site</div>
      </div>
    );
  }

  return (
    <div className="pb-16">
      <div className="mb-6">
        <Link
          href={`/dashboard/sites/${siteKey}/brands`}
          className="text-sm text-zinc-500 hover:text-zinc-900"
        >
          &larr; Back to Brands
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">
          {brandName || brandId}
        </h1>
        <p className="text-zinc-500 font-mono text-sm">{brandId}</p>
      </div>

      <SiteBrandEditor
        brandId={brandId}
        siteKey={siteKey}
        state={state}
        updateField={updateField}
      />

      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 bg-amber-50 border-t border-amber-200 px-6 py-3 flex items-center justify-between z-50">
          <span className="text-sm text-amber-800 font-medium">
            You have unsaved changes
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
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
