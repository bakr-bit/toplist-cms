import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.ADMIN_EMAIL || "accounts@bakersfield.ae";
  const password = process.env.ADMIN_PASSWORD || "SandSkier3000!!";

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: "admin" },
    create: {
      email,
      passwordHash,
      name: "Admin",
      role: "admin",
    },
  });

  console.log(`Admin user created/updated: ${user.email}`);

  // Create a sample brand
  const brand = await prisma.brand.upsert({
    where: { brandId: "demo-casino" },
    update: {},
    create: {
      brandId: "demo-casino",
      name: "Demo Casino",
      defaultLogo: "https://placehold.co/200x100?text=Demo",
      website: "https://example.com",
    },
  });

  console.log(`Sample brand created: ${brand.brandId}`);

  // Create a sample site
  const site = await prisma.site.upsert({
    where: { siteKey: "demo-site" },
    update: {},
    create: {
      siteKey: "demo-site",
      domain: "demo.site",
      name: "Demo Site",
    },
  });

  console.log(`Sample site created: ${site.siteKey}`);

  // Create a sample toplist
  const toplist = await prisma.toplist.upsert({
    where: {
      siteKey_slug: {
        siteKey: "demo-site",
        slug: "main",
      },
    },
    update: {},
    create: {
      siteKey: "demo-site",
      slug: "main",
      title: "Top Casinos",
    },
  });

  console.log(`Sample toplist created: ${toplist.slug}`);

  // Add an item to the toplist
  const existingItem = await prisma.toplistItem.findFirst({
    where: {
      toplistId: toplist.id,
      brandId: brand.brandId,
    },
  });

  if (!existingItem) {
    await prisma.toplistItem.create({
      data: {
        toplistId: toplist.id,
        brandId: brand.brandId,
        position: 0,
        cta: "Play Now",
      },
    });
    console.log(`Sample toplist item added`);
  }

  console.log("\nSeed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
