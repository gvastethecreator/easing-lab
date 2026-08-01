import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const checks = ["format:check", "lint", "typecheck", "unused", "test", "build", "metrics"];
const startedAt = new Date();
const results = [];

for (const check of checks) {
  console.log(`\n[verify] bun run ${check}`);
  const result = spawnSync("bun", ["run", check], {
    cwd: process.cwd(),
    encoding: "utf8",
    shell: process.platform === "win32",
  });

  process.stdout.write(result.stdout ?? "");
  process.stderr.write(result.stderr ?? "");
  results.push({ check, exitCode: result.status ?? 1 });

  if (result.status !== 0) break;
}

const failed = results.find((result) => result.exitCode !== 0);
const report = {
  startedAt: startedAt.toISOString(),
  finishedAt: new Date().toISOString(),
  status: failed ? "failed" : "passed",
  results,
};

mkdirSync(resolve(process.cwd(), "logs"), { recursive: true });
writeFileSync(resolve(process.cwd(), "logs/verify.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(`\n[verify] ${report.status.toUpperCase()} — logs/verify.json`);
process.exit(failed?.exitCode ?? 0);
