export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-12 px-4">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          Toplist API
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
          Centralized toplist management for your sites
        </p>

        <section className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            Public Endpoint
          </h2>
          <div className="bg-zinc-100 dark:bg-zinc-900 rounded p-4 font-mono text-sm mb-4">
            <span className="text-green-600 dark:text-green-400">GET</span>{" "}
            /api/sites/{"{siteKey}"}/toplists/{"{slug}"}
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            Returns a toplist with all items for consumption by client sites.
          </p>
          <details className="text-sm">
            <summary className="cursor-pointer text-zinc-700 dark:text-zinc-300 font-medium">
              Response Example
            </summary>
            <pre className="bg-zinc-100 dark:bg-zinc-900 rounded p-4 mt-2 overflow-x-auto">
{`{
  "siteKey": "cazinou-io",
  "slug": "main",
  "updatedAt": "2026-01-14T10:00:00Z",
  "items": [
    {
      "brandId": "velobet-casino",
      "name": "VeloBet Casino",
      "logo": "/media/velobet.webp",
      "affiliateUrl": "https://...",
      "reviewUrl": "/reviews/velobet",
      "bonus": "330% up to 10,000 RON",
      "rating": 8.8,
      "cta": "Play Now"
    }
  ]
}`}
            </pre>
          </details>
        </section>

        <section className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            Management Endpoints
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            All management endpoints require authentication via session cookie.
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-zinc-800 dark:text-zinc-200 mb-2">
                Brands
              </h3>
              <div className="bg-zinc-100 dark:bg-zinc-900 rounded p-3 font-mono text-sm space-y-1">
                <div><span className="text-green-600">GET</span> /api/brands</div>
                <div><span className="text-blue-600">POST</span> /api/brands</div>
                <div><span className="text-green-600">GET</span> /api/brands/{"{brandId}"}</div>
                <div><span className="text-yellow-600">PUT</span> /api/brands/{"{brandId}"}</div>
                <div><span className="text-red-600">DELETE</span> /api/brands/{"{brandId}"}</div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-zinc-800 dark:text-zinc-200 mb-2">
                Sites
              </h3>
              <div className="bg-zinc-100 dark:bg-zinc-900 rounded p-3 font-mono text-sm space-y-1">
                <div><span className="text-green-600">GET</span> /api/sites</div>
                <div><span className="text-blue-600">POST</span> /api/sites</div>
                <div><span className="text-green-600">GET</span> /api/sites/{"{siteKey}"}</div>
                <div><span className="text-yellow-600">PUT</span> /api/sites/{"{siteKey}"}</div>
                <div><span className="text-red-600">DELETE</span> /api/sites/{"{siteKey}"}</div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-zinc-800 dark:text-zinc-200 mb-2">
                Toplists
              </h3>
              <div className="bg-zinc-100 dark:bg-zinc-900 rounded p-3 font-mono text-sm space-y-1">
                <div><span className="text-green-600">GET</span> /api/sites/{"{siteKey}"}/toplists</div>
                <div><span className="text-blue-600">POST</span> /api/sites/{"{siteKey}"}/toplists</div>
                <div><span className="text-yellow-600">PUT</span> /api/sites/{"{siteKey}"}/toplists/{"{slug}"}</div>
                <div><span className="text-red-600">DELETE</span> /api/sites/{"{siteKey}"}/toplists/{"{slug}"}</div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-zinc-800 dark:text-zinc-200 mb-2">
                Toplist Items
              </h3>
              <div className="bg-zinc-100 dark:bg-zinc-900 rounded p-3 font-mono text-sm">
                <div><span className="text-yellow-600">PUT</span> /api/sites/{"{siteKey}"}/toplists/{"{slug}"}/items</div>
              </div>
              <p className="text-zinc-500 dark:text-zinc-500 text-sm mt-2">
                Replaces all items in the toplist. Order is determined by array index.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            Getting Started
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-zinc-600 dark:text-zinc-400">
            <li>Configure your Supabase database URL in <code className="bg-zinc-100 dark:bg-zinc-900 px-1 rounded">.env</code></li>
            <li>Run <code className="bg-zinc-100 dark:bg-zinc-900 px-1 rounded">npm run db:migrate</code> to create tables</li>
            <li>Run <code className="bg-zinc-100 dark:bg-zinc-900 px-1 rounded">npm run db:seed</code> to create admin user</li>
            <li>Start the server with <code className="bg-zinc-100 dark:bg-zinc-900 px-1 rounded">npm run dev</code></li>
            <li>Login at <code className="bg-zinc-100 dark:bg-zinc-900 px-1 rounded">/api/auth/signin</code></li>
          </ol>
        </section>
      </main>
    </div>
  );
}
