"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteDialog } from "@/components/dashboard/SiteDialog";
import { toast } from "sonner";

interface Serp {
  keyword: string;
  geo: string;
}

interface Site {
  siteKey: string;
  domain: string;
  name: string;
  serps: Serp[] | null;
  toplistCount: number;
}

export default function SitesPage() {
  const { data: session } = useSession();
  const isAdminUser = session?.user?.role === "admin";
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);

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
        {isAdminUser && (
          <Button onClick={() => { setEditingSite(null); setDialogOpen(true); }}>Add Site</Button>
        )}
      </div>

      {loading ? (
        <div className="text-zinc-500">Loading...</div>
      ) : sites.length === 0 ? (
        <div className="text-zinc-500">No sites yet. Create your first one!</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sites.map((site) => (
            <Link key={site.siteKey} href={`/dashboard/sites/${site.siteKey}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
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
                {site.serps && site.serps.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {site.serps.slice(0, 3).map((serp, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded"
                      >
                        <span
                          className={`fflag fflag-${serp.geo} ff-sm`}
                          title={serp.geo}
                        />
                        {serp.keyword}
                      </span>
                    ))}
                    {site.serps.length > 3 && (
                      <span className="text-xs text-zinc-400">
                        +{site.serps.length - 3} more
                      </span>
                    )}
                  </div>
                )}
                <p className="text-sm text-zinc-500 mb-4">
                  {site.toplistCount} toplist{site.toplistCount !== 1 ? "s" : ""}
                </p>
                {isAdminUser && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => { e.preventDefault(); setEditingSite(site); setDialogOpen(true); }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => { e.preventDefault(); handleDelete(site.siteKey); }}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            </Link>
          ))}
        </div>
      )}

      <SiteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        site={editingSite}
        onSuccess={() => {
          loadSites();
          toast.success(editingSite ? "Site updated" : "Site created");
        }}
      />
    </div>
  );
}
