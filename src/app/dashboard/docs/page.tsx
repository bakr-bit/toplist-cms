"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Highlight, themes } from "prism-react-renderer";
import { toast } from "sonner";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="absolute right-2 top-2 rounded bg-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-600"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  // Map language names to Prism language keys
  const langMap: Record<string, string> = {
    env: "bash",
    typescript: "tsx",
    javascript: "jsx",
    json: "json",
    tsx: "tsx",
  };
  const prismLang = langMap[language] || language;

  return (
    <div className="relative mt-2 mb-4">
      <Highlight theme={themes.nightOwl} code={code.trim()} language={prismLang}>
        {({ style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className="overflow-x-auto rounded-lg p-4 text-sm"
            style={{ ...style, backgroundColor: "#0d1117" }}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
      <CopyButton text={code.trim()} />
      <span className="absolute left-2 top-2 text-xs text-zinc-500">
        {language}
      </span>
    </div>
  );
}

export default function DocsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.replace("/dashboard/sites");
    }
  }, [status, session, router]);

  return (
    <div className="max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">
        API Integration Guide
      </h1>
      <p className="mb-8 text-zinc-600">
        Connect your Next.js site to the Toplist CMS API.
      </p>

      {/* Section 1 */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-zinc-900">
          1. Environment Setup
        </h2>
        <p className="mb-2 text-zinc-600">
          Add to your <code className="rounded bg-zinc-100 px-1">.env.local</code>:
        </p>
        <CodeBlock
          language="env"
          code={`NEXT_PUBLIC_TOPLIST_API_URL=https://toplist-cms.vercel.app/api
NEXT_PUBLIC_SITE_KEY=your-site-key`}
        />
        <p className="text-sm text-zinc-500">
          The <code className="rounded bg-zinc-100 px-1">SITE_KEY</code> is your
          domain with dots replaced by dashes (e.g.,{" "}
          <code className="rounded bg-zinc-100 px-1">cazinou.io</code> →{" "}
          <code className="rounded bg-zinc-100 px-1">cazinou-io</code>).
        </p>
      </section>

      {/* Section 2 */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-zinc-900">
          2. Fetching Code
        </h2>
        <p className="mb-2 text-zinc-600">
          Add <code className="rounded bg-zinc-100 px-1">lib/toplists.ts</code>:
        </p>
        <CodeBlock
          language="typescript"
          code={`export interface ToplistItem {
  brandId: string
  name: string
  logo?: string
  affiliateUrl?: string
  reviewUrl?: string
  bonus?: string
  rating?: number
  cta?: string
  terms?: string
}

const API_URL = process.env.NEXT_PUBLIC_TOPLIST_API_URL
const SITE_KEY = process.env.NEXT_PUBLIC_SITE_KEY

export async function fetchToplist(slug: string): Promise<ToplistItem[]> {
  if (!API_URL || !SITE_KEY) {
    return [] // or fallback to local data
  }

  try {
    const res = await fetch(\`\${API_URL}/sites/\${SITE_KEY}/toplists/\${slug}\`, {
      next: { revalidate: 300 } // Cache 5 minutes
    })

    if (!res.ok) return []

    const data = await res.json()
    return data.items
  } catch {
    return []
  }
}`}
        />
      </section>

      {/* Section 3 */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-zinc-900">
          3. Usage in Components
        </h2>
        <CodeBlock
          language="tsx"
          code={`// Server Component (recommended)
import { fetchToplist } from '@/lib/toplists'

export async function CasinoList({ toplistId }: { toplistId: string }) {
  const items = await fetchToplist(toplistId)

  return (
    <ul>
      {items.map((item) => (
        <li key={item.brandId}>
          <img src={item.logo} alt={item.name} />
          <span>{item.name}</span>
          <span>{item.bonus}</span>
          <a href={item.affiliateUrl}>{item.cta || 'Play Now'}</a>
        </li>
      ))}
    </ul>
  )
}`}
        />
      </section>

      {/* Section 4 */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-zinc-900">
          4. Allow External Images
        </h2>
        <p className="mb-2 text-zinc-600">
          Add to <code className="rounded bg-zinc-100 px-1">next.config.mjs</code>:
        </p>
        <CodeBlock
          language="javascript"
          code={`const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
}`}
        />
      </section>

      {/* API Response */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-zinc-900">
          API Response Format
        </h2>
        <p className="mb-2 text-zinc-600">
          <code className="rounded bg-zinc-100 px-1">
            GET /api/sites/{"{siteKey}"}/toplists/{"{slug}"}
          </code>
        </p>
        <CodeBlock
          language="json"
          code={`{
  "siteKey": "cazinou-io",
  "slug": "toplist-abc123",
  "title": "Best Casinos",
  "updatedAt": "2026-01-14T10:00:00Z",
  "items": [
    {
      "brandId": "velobet-casino",
      "name": "VeloBet Casino",
      "logo": "https://...",
      "affiliateUrl": "https://...",
      "bonus": "100% up to $500",
      "rating": 9.5,
      "cta": "Play Now"
    }
  ]
}`}
        />
      </section>

      {/* Fallback */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-zinc-900">
          Fallback Strategy
        </h2>
        <p className="mb-4 text-zinc-600">
          If the API is unavailable, the fetch function returns an empty array.
          For production, keep a local{" "}
          <code className="rounded bg-zinc-100 px-1">toplists.json</code> as
          fallback:
        </p>
        <CodeBlock
          language="typescript"
          code={`import localData from './toplists.json'

export async function fetchToplist(slug: string): Promise<ToplistItem[]> {
  if (!API_URL || !SITE_KEY) {
    return getLocalToplist(slug)
  }

  try {
    const res = await fetch(\`\${API_URL}/sites/\${SITE_KEY}/toplists/\${slug}\`, {
      next: { revalidate: 300 }
    })
    if (!res.ok) return getLocalToplist(slug)
    return (await res.json()).items
  } catch {
    return getLocalToplist(slug)
  }
}

function getLocalToplist(slug: string): ToplistItem[] {
  const toplist = localData.toplists[slug]
  if (!toplist) return []
  return toplist.items.map(id => localData.items[id]).filter(Boolean)
}`}
        />
      </section>
    </div>
  );
}
