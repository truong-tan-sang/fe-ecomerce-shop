import { copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const which = process.argv[2];
if (!which) {
  console.error("Usage: node scripts/use-env.mjs <dev|prod-be>");
  process.exit(1);
}

const source = resolve(`.env.${which}`);
const target = resolve(".env.local");

if (!existsSync(source)) {
  console.error(`[use-env] Missing ${source}`);
  process.exit(1);
}

copyFileSync(source, target);
console.log(`[use-env] Copied ${source} → .env.local`);
