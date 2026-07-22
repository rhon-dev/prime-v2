/**
 * One-time data migration: rename legacy comment visibility values to the
 * 6-tier model introduced in fix-plan.md Task 5 (2026-07-22).
 *
 * Mapping (confirmed by controller):
 *   "PUBLIC"   → "APPLICANT_VISIBLE"
 *   "INTERNAL" → "FOCAL_AND_INTERNAL"
 *
 * This script is idempotent — re-running it after the migration has already
 * been applied is safe (UPDATE affects 0 rows if the old values no longer exist).
 *
 * Usage:
 *   npx tsx prisma/migrate-comment-visibility.ts
 *
 * Run this once against each environment (dev, staging, production) before
 * deploying the backend code that enforces the new tier names.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const publicCount = await prisma.proposalComment.count({
    where: { visibility: "PUBLIC" },
  });
  const internalCount = await prisma.proposalComment.count({
    where: { visibility: "INTERNAL" },
  });

  console.log(`Found ${publicCount} PUBLIC and ${internalCount} INTERNAL comments to migrate.`);

  if (publicCount > 0) {
    const result = await prisma.proposalComment.updateMany({
      where: { visibility: "PUBLIC" },
      data: { visibility: "APPLICANT_VISIBLE" },
    });
    console.log(`  Renamed PUBLIC → APPLICANT_VISIBLE: ${result.count} rows`);
  }

  if (internalCount > 0) {
    const result = await prisma.proposalComment.updateMany({
      where: { visibility: "INTERNAL" },
      data: { visibility: "FOCAL_AND_INTERNAL" },
    });
    console.log(`  Renamed INTERNAL → FOCAL_AND_INTERNAL: ${result.count} rows`);
  }

  // Verify no legacy values remain
  const remainingLegacy = await prisma.proposalComment.count({
    where: { visibility: { in: ["PUBLIC", "INTERNAL"] } },
  });

  if (remainingLegacy > 0) {
    console.error(`ERROR: ${remainingLegacy} legacy visibility rows still remain after migration.`);
    process.exit(1);
  }

  console.log("Migration complete. No legacy visibility values remain.");
}

main()
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
