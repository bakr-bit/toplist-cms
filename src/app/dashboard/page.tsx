import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const [brandCount, siteCount, toplistCount] = await Promise.all([
    prisma.brand.count(),
    prisma.site.count(),
    prisma.toplist.count(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 mb-6">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Total Brands
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{brandCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Total Sites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{siteCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Total Toplists
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{toplistCount}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
