import { createWriteStream, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';

const [logName, command, ...args] = process.argv.slice(2);

if (!logName || !command) {
  console.error('Uso: bun scripts/run-with-log.mjs <log> <comando> [...args]');
  process.exit(1);
}

const logsDirectory = resolve(process.cwd(), 'logs');
mkdirSync(logsDirectory, { recursive: true });

const logPath = resolve(logsDirectory, `${logName}.log`);
const log = createWriteStream(logPath, { flags: 'a' });
const startedAt = Date.now();
const heading = `\n=== ${new Date(startedAt).toISOString()} | ${command} ${args.join(' ')} ===\n`;

process.stdout.write(heading);
log.write(heading);

const child = spawn(command, args, {
  cwd: process.cwd(),
  env: process.env,
  shell: process.platform === 'win32',
  stdio: ['inherit', 'pipe', 'pipe'],
});

const mirror = (stream, destination) => {
  stream.on('data', (chunk) => {
    destination.write(chunk);
    log.write(chunk);
  });
};

mirror(child.stdout, process.stdout);
mirror(child.stderr, process.stderr);

child.on('error', (error) => {
  const message = `\nERROR: ${error.stack ?? error.message}\n`;
  process.stderr.write(message);
  log.end(message);
  process.exitCode = 1;
});

child.on('close', (code) => {
  const durationMs = Date.now() - startedAt;
  const footer = `\n=== ${new Date().toISOString()} | exit ${code ?? 1} | ${durationMs} ms ===\n`;
  process.stdout.write(footer);
  log.end(footer, () => process.exit(code ?? 1));
});
