"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteDialog } from "@/components/dashboard/SiteDialog";
import { toast } from "sonner";

interface Site {
  siteKey: string;
  domain: string;
  name: string;
  toplistCount: number;
}

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  async function loadSites() {
    try {
      const res = await fetch("/api/sites");
      if (res.ok) {
        setSites(await res.json());
      }
    } catch {
      toast.error("Failed to load sites");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSites();
  }, []);

  async function handleDelete(siteKey: string) {
    if (
      !confirm(
        "Are you sure you want to delete this site? All toplists will be deleted."
      )
    )
      return;

    try {
      const res = await fetch(`/api/sites/${siteKey}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Site deleted");
        loadSites();
      } else {
        toast.error("Failed to delete site");
      }
    } catch {
      toast.error("Failed to delete site");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Sites</h1>
        <Button onClick={() => setDialogOpen(true)}>Add Site</Button>
      </div>

      {loading ? (
        <div className="text-zinc-500">Loading...</div>
      ) : sites.length === 0 ? (
        <div className="text-zinc-500">No sites yet. Create your first one!</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sites.map((site) => (
            <Card key={site.siteKey} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${site.domain}&sz=32`}
                    alt=""
                    className="h-6 w-6 rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <CardTitle className="text-lg">{site.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-zinc-500 mb-1">{site.domain}</p>
                <p className="text-sm text-zinc-500 mb-4">
                  {site.toplistCount} toplist{site.toplistCount !== 1 ? "s" : ""}
                </p>
                <div className="flex gap-2">
                  <Link href={`/dashboard/sites/${site.siteKey}`}>
                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(site.siteKey)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <SiteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => {
          loadSites();
          toast.success("Site created");
        }}
      />
    </div>
  );
}
