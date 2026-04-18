import "dotenv/config";
import { readFile } from "node:fs/promises";
import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("TURSO_DATABASE_URL en/of TURSO_AUTH_TOKEN ontbreken in .env");
  process.exit(1);
}

const sql = await readFile(new URL("../schema.sql", import.meta.url), "utf8");
const sqlNoComments = sql
  .split("\n")
  .filter((line) => !line.trim().startsWith("--"))
  .join("\n");
const statements = sqlNoComments
  .split(/;\s*(?=\n|$)/)
  .map((s) => s.trim())
  .filter(Boolean);

const client = createClient({ url, authToken });
console.log(`Pushing ${statements.length} statement(s) to ${url}`);

for (const stmt of statements) {
  const preview = stmt.split("\n")[0].slice(0, 70);
  try {
    await client.execute(stmt);
    console.log(`  ok  ${preview}`);
  } catch (err) {
    console.error(`  fail ${preview}`);
    console.error(`       ${err.message}`);
    process.exit(1);
  }
}

console.log("Done.");
