"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToplistDialog } from "@/components/dashboard/ToplistDialog";
import { ToplistImportDialog } from "@/components/dashboard/ToplistImportDialog";
import { toast } from "sonner";

interface Toplist {
  id: string;
  slug: string;
  title: string | null;
  pages: string[];
  itemCount: number;
  updatedAt: string;
}

interface Serp {
  keyword: string;
  geo: string;
}

interface Site {
  siteKey: string;
  domain: string;
  name: string;
  serps: Serp[] | null;
  toplists: Toplist[];
}

export default function SiteDetailPage() {
  const params = useParams();
  const siteKey = params.siteKey as string;

  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedPages, setExpandedPages] = useState<string | null>(null);

  // Filter toplists by page name search
  const filteredToplists = useMemo(() => {
    if (!site || !search.trim()) return site?.toplists || [];
    const query = search.toLowerCase();
    return site.toplists.filter(
      (t) =>
        t.slug.toLowerCase().includes(query) ||
        t.title?.toLowerCase().includes(query) ||
        t.pages.some((p) => p.toLowerCase().includes(query))
    );
  }, [site, search]);

  async function loadSite() {
    try {
      const res = await fetch(`/api/sites/${siteKey}`);
      if (res.ok) {
        setSite(await res.json());
      } else {
        toast.error("Site not found");
      }
    } catch {
      toast.error("Failed to load site");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSite();
  }, [siteKey]);

  async function handleDeleteToplist(slug: string) {
    if (!confirm("Are you sure you want to delete this toplist?")) return;

    try {
      const res = await fetch(`/api/sites/${siteKey}/toplists/${slug}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Toplist deleted");
        loadSite();
      } else {
        toast.error("Failed to delete toplist");
      }
    } catch {
      toast.error("Failed to delete toplist");
    }
  }

  if (loading) {
    return <div className="text-zinc-500">Loading...</div>;
  }

  if (!site) {
    return <div className="text-zinc-500">Site not found</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/sites"
          className="text-sm text-zinc-500 hover:text-zinc-900"
        >
          ← Back to Sites
        </Link>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{site.name}</h1>
          <p className="text-zinc-500">{site.domain}</p>
          {site.serps && site.serps.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {site.serps.map((serp, i) => (
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
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setImportDialogOpen(true)}
          >
            Import JSON
          </Button>
          <Button onClick={() => setDialogOpen(true)}>Add Toplist</Button>
        </div>
      </div>

      <Link
        href={`/dashboard/sites/${siteKey}/brands`}
        className="flex items-center gap-2 mb-6 w-fit rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:from-violet-700 hover:to-indigo-700 transition-all"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
        </svg>
        Site Brands
        <span className="rounded bg-white/20 px-1.5 py-0.5 text-xs">
          Manage
        </span>
      </Link>

      <h2 className="text-lg font-semibold text-zinc-900 mb-4">Toplists</h2>

      {site.toplists.length === 0 ? (
        <div className="text-zinc-500">
          No toplists yet. Create your first one!
        </div>
      ) : (
        <>
          <div className="mb-4">
            <Input
              placeholder="Search by page name, toplist slug, or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md"
            />
          </div>
          {filteredToplists.length === 0 ? (
            <div className="text-zinc-500">
              No toplists found matching &quot;{search}&quot;
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredToplists.map((toplist) => (
                <Link key={toplist.id} href={`/dashboard/sites/${siteKey}/toplists/${toplist.slug}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      {toplist.title || toplist.slug}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-zinc-500 font-mono mb-1">
                      /{toplist.slug}
                    </p>
                    <p className="text-sm text-zinc-500 mb-1">
                      {toplist.itemCount} item{toplist.itemCount !== 1 ? "s" : ""}
                    </p>
                    {toplist.pages.length > 0 && (
                      <div className="mb-4">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setExpandedPages(
                              expandedPages === toplist.id ? null : toplist.id
                            );
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {toplist.pages.length} page
                          {toplist.pages.length !== 1 ? "s" : ""}
                          {expandedPages === toplist.id ? " ▲" : " ▼"}
                        </button>
                        {expandedPages === toplist.id && (
                          <div className="mt-2 p-2 bg-zinc-50 rounded text-xs text-zinc-600 max-h-32 overflow-y-auto">
                            {toplist.pages.map((page) => (
                              <div key={page} className="py-0.5">
                                /{page}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {toplist.pages.length === 0 && <div className="mb-4" />}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => { e.preventDefault(); handleDeleteToplist(toplist.slug); }}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      <ToplistDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        siteKey={siteKey}
        onSuccess={() => {
          loadSite();
          toast.success("Toplist created");
        }}
      />

      <ToplistImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        siteKey={siteKey}
        onSuccess={(result) => {
          loadSite();
          toast.success(
            `Imported ${result.imported} toplists, skipped ${result.skipped} existing`
          );
          if (result.warnings > 0) {
            toast.warning(`${result.warnings} warnings (see console)`);
          }
          if (result.errors > 0) {
            toast.error(`${result.errors} toplists failed to import`);
          }
        }}
      />
    </div>
  );
}
