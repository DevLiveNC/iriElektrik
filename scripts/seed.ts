import { readFileSync } from "node:fs";
import { join } from "node:path";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../lib/db/schema";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL tanımlı değil.");
  const seed = JSON.parse(readFileSync(join(process.cwd(), "data", "seed.json"), "utf-8")) as {
    business: Record<string, unknown>;
    jobs: Array<Record<string, unknown>>;
  };
  const client = postgres(url, { prepare: false });
  const db = drizzle(client, { schema });

  // Mevcut doğrulanmış işletme ayarlarını asla başlangıç verisiyle ezmeyiz.
  await db
    .insert(schema.businessSettings)
    .values({ id: 1, data: seed.business })
    .onConflictDoNothing({ target: schema.businessSettings.id });

  for (const job of seed.jobs.filter((item) => item.isExample !== true)) {
    const j = job as unknown as {
      id: string; title: string; slug: string; category: string; vehicle: string;
      symptom: string; diagnosis: string; application: string; result: string;
      cover: string; gallery: string[]; alt: string; status: string; featured: boolean;
      sortOrder: number; publishedAt: string | null; createdAt: string; updatedAt: string; isExample?: boolean;
    };
    await db
      .insert(schema.jobs)
      .values({
        ...j,
        publishedAt: j.publishedAt ? new Date(j.publishedAt) : null,
        createdAt: new Date(j.createdAt),
        updatedAt: new Date(j.updatedAt),
        isExample: j.isExample ?? false,
      })
      .onConflictDoNothing({ target: schema.jobs.id });
  }
  console.log("Seed tamamlandı.");
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
