import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brotliCompressSync, gzipSync } from 'node:zlib';

const scriptDir = fileURLToPath(new URL('.', import.meta.url));
const rootDir = resolve(scriptDir, '..');
const distDir = join(rootDir, 'dist');
const logsDir = join(rootDir, 'logs');
const docsDir = join(rootDir, 'docs');
const metricsJsonPath = join(logsDir, 'metrics.json');
const metricsMarkdownPath = join(docsDir, 'METRICAS.md');

if (!existsSync(distDir)) {
  throw new Error('No se encontró la carpeta dist. Ejecuta primero "bun run build".');
}

mkdirSync(logsDir, { recursive: true });
mkdirSync(docsDir, { recursive: true });

const collectFiles = (directory) => {
  const entries = readdirSync(directory, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      return collectFiles(fullPath);
    }

    return [fullPath];
  });
};

const formatKb = (value) => `${(value / 1024).toFixed(2)} KB`;

const files = collectFiles(distDir);

const assets = files.map((filePath) => {
  const buffer = readFileSync(filePath);
  const relativePath = relative(rootDir, filePath).replace(/\\/g, '/');
  const size = statSync(filePath).size;

  return {
    file: relativePath,
    extension: extname(filePath) || 'none',
    size,
    gzip: gzipSync(buffer).byteLength,
    brotli: brotliCompressSync(buffer).byteLength,
  };
});

const runtimeAssets = assets.filter((asset) => !asset.file.endsWith('.map'));

const sumBy = (predicate, key) =>
  runtimeAssets.filter(predicate).reduce((total, asset) => total + asset[key], 0);

const totalSize = sumBy(() => true, 'size');
const totalJs = sumBy((asset) => asset.extension === '.js', 'size');
const totalCss = sumBy((asset) => asset.extension === '.css', 'size');
const totalHtml = sumBy((asset) => asset.extension === '.html', 'size');
const totalGzip = sumBy(() => true, 'gzip');
const totalBrotli = sumBy(() => true, 'brotli');
const largestAsset = [...runtimeAssets].sort((a, b) => b.size - a.size)[0] ?? null;

const metrics = {
  generatedAt: new Date().toISOString(),
  budgets: {
    totalJsMaxBytes: 250 * 1024,
    largestAssetMaxBytes: 350 * 1024,
    htmlBootstrapMaxBytes: 4 * 1024,
  },
  totals: {
    size: totalSize,
    gzip: totalGzip,
    brotli: totalBrotli,
    js: totalJs,
    css: totalCss,
    html: totalHtml,
  },
  checks: {
    jsBudgetOk: totalJs <= 250 * 1024,
    largestAssetBudgetOk: largestAsset ? largestAsset.size <= 350 * 1024 : true,
    htmlBootstrapBudgetOk: totalHtml <= 4 * 1024,
  },
  largestAsset,
  assets: runtimeAssets,
};

writeFileSync(metricsJsonPath, `${JSON.stringify(metrics, null, 2)}\n`, 'utf8');

const assetRows = runtimeAssets
  .map(
    (asset) =>
      `| \`${asset.file}\` | ${formatKb(asset.size)} | ${formatKb(asset.gzip)} | ${formatKb(asset.brotli)} |`
  )
  .join('\n');

const markdown = `# Métricas

Última actualización automática: **${metrics.generatedAt}**

## Bundle generado

- Tamaño total: **${formatKb(totalSize)}**
- JavaScript total: **${formatKb(totalJs)}**
- CSS total: **${formatKb(totalCss)}**
- HTML inicial: **${formatKb(totalHtml)}**
- Transfer estimado gzip: **${formatKb(totalGzip)}**
- Transfer estimado Brotli: **${formatKb(totalBrotli)}**

## Presupuestos simples

- JS total < 250 KB: **${metrics.checks.jsBudgetOk ? 'OK' : 'REVISAR'}**
- Asset individual más grande < 350 KB: **${metrics.checks.largestAssetBudgetOk ? 'OK' : 'REVISAR'}**
- HTML inicial < 4 KB: **${metrics.checks.htmlBootstrapBudgetOk ? 'OK' : 'REVISAR'}**

## Asset más pesado

${
  largestAsset
    ? `- \`${largestAsset.file}\` — **${formatKb(largestAsset.size)}** (${formatKb(largestAsset.gzip)} gzip)`
    : '- Sin assets detectados.'
}

## Arranque en cliente

La aplicación publica métricas ligeras de arranque en \`window.__EASING_LAB_STARTUP_METRICS__\` después del segundo frame de render. Esto permite inspeccionar rápidamente:

- \`firstFrameMs\`
- \`domContentLoadedMs\`
- \`loadEventMs\`
- \`firstPaintMs\`
- \`firstContentfulPaintMs\`

En desarrollo también se muestran por consola para inspección rápida.

## Desglose de archivos

| Archivo | Tamaño | Gzip | Brotli |
| --- | ---: | ---: | ---: |
${assetRows}
`;

writeFileSync(metricsMarkdownPath, markdown, 'utf8');

const formatResult = spawnSync(
  process.execPath,
  ['x', 'oxfmt', metricsJsonPath, metricsMarkdownPath],
  {
    cwd: rootDir,
    stdio: 'inherit',
    shell: false,
  }
);

if (formatResult.status !== 0) {
  throw new Error('No se pudieron formatear los archivos de métricas generados.');
}

console.log(`Métricas guardadas en ${relative(rootDir, metricsJsonPath)}`);
console.log(`Resumen Markdown actualizado en ${relative(rootDir, metricsMarkdownPath)}`);
console.log(
  `JS total: ${formatKb(totalJs)} | CSS total: ${formatKb(totalCss)} | HTML: ${formatKb(totalHtml)}`
);
