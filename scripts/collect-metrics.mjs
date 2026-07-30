import { brotliCompressSync, gzipSync } from "node:zlib";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";

const root = process.cwd();
const dist = resolve(root, "dist");

if (!existsSync(dist)) {
  throw new Error("No existe dist/. Ejecuta `bun run build` antes de medir.");
}

const walk = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });

const assets = walk(dist).map((path) => {
  const contents = readFileSync(path);
  return {
    file: relative(root, path).replaceAll("\\", "/"),
    extension: extname(path),
    size: statSync(path).size,
    gzip: gzipSync(contents).byteLength,
    brotli: brotliCompressSync(contents).byteLength,
  };
});

const indexHtml = readFileSync(join(dist, "index.html"), "utf8");
const initialAssetNames = new Set(
  [...indexHtml.matchAll(/(?:src|href)=["']([^"']+\.js)["']/g)].map((match) =>
    match[1].split("/").at(-1),
  ),
);
const total = (key, predicate = () => true) =>
  assets.filter(predicate).reduce((sum, asset) => sum + asset[key], 0);
const initialJs = total(
  "size",
  (asset) => asset.extension === ".js" && initialAssetNames.has(asset.file.split("/").at(-1)),
);
const largestAsset = assets.toSorted((a, b) => b.size - a.size)[0] ?? null;
const budgets = {
  initialJsMaxBytes: 350 * 1024,
  largestLazyAssetMaxBytes: 600 * 1024,
};
const metrics = {
  generatedAt: new Date().toISOString(),
  budgets,
  checks: {
    initialJs: initialJs <= budgets.initialJsMaxBytes,
    largestLazyAsset: !largestAsset || largestAsset.size <= budgets.largestLazyAssetMaxBytes,
  },
  totals: {
    size: total("size"),
    gzip: total("gzip"),
    brotli: total("brotli"),
    initialJs,
    javascript: total("size", (asset) => asset.extension === ".js"),
    css: total("size", (asset) => asset.extension === ".css"),
  },
  largestAsset,
  assets,
};

const kb = (bytes) => `${(bytes / 1024).toFixed(2)} KB`;
const formatTable = (headers, rows, alignments) => {
  const widths = headers.map((header, index) =>
    Math.max(header.length, ...rows.map((row) => String(row[index]).length)),
  );
  const formatCell = (value, index) => {
    const text = String(value);
    return alignments[index] === "right"
      ? text.padStart(widths[index])
      : text.padEnd(widths[index]);
  };
  const header = `| ${headers.map(formatCell).join(" | ")} |`;
  const separator = `| ${widths
    .map((width, index) => {
      const dashes = "-".repeat(width);
      return alignments[index] === "right" ? `${dashes.slice(0, -1)}:` : dashes;
    })
    .join(" | ")} |`;
  const body = rows.map((row) => `| ${row.map(formatCell).join(" | ")} |`);
  return [header, separator, ...body].join("\n");
};
const summaryTable = formatTable(
  ["Métrica", "Resultado", "Presupuesto"],
  [
    ["JavaScript inicial", kb(metrics.totals.initialJs), kb(budgets.initialJsMaxBytes)],
    [
      "Asset diferido más grande",
      kb(largestAsset?.size ?? 0),
      kb(budgets.largestLazyAssetMaxBytes),
    ],
    ["Transferencia gzip total", kb(metrics.totals.gzip), "Informativo"],
    ["Transferencia Brotli total", kb(metrics.totals.brotli), "Informativo"],
  ],
  ["left", "right", "right"],
);
const assetTable = formatTable(
  ["Archivo", "Crudo", "Gzip", "Brotli"],
  assets.map((asset) => [`\`${asset.file}\``, kb(asset.size), kb(asset.gzip), kb(asset.brotli)]),
  ["left", "right", "right", "right"],
);
const markdown = `# Métricas del bundle

Generado: **${metrics.generatedAt}**

${summaryTable}

Los motores se cargan bajo demanda. El total incluye GSAP, Motion, Anime.js y Three.js aunque una visita normal solo carga el motor elegido.

## Archivos

${assetTable}
`;

mkdirSync(resolve(root, "logs"), { recursive: true });
mkdirSync(resolve(root, "docs"), { recursive: true });
writeFileSync(resolve(root, "logs/metrics.json"), `${JSON.stringify(metrics, null, 2)}\n`);
writeFileSync(resolve(root, "docs/METRICAS.md"), markdown);

console.log(`JS inicial: ${kb(initialJs)}; asset mayor: ${kb(largestAsset?.size ?? 0)}`);
if (Object.values(metrics.checks).includes(false)) process.exitCode = 1;
