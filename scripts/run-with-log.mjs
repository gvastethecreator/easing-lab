import { spawn } from 'node:child_process';
import { createWriteStream, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const [logName, command, ...commandArgs] = args;

if (!logName || !command) {
  console.error('Usage: bun ./scripts/run-with-log.mjs <log-name> <command> [...args]');
  process.exit(1);
}

const logsDir = resolve(process.cwd(), 'logs');
mkdirSync(logsDir, { recursive: true });

const logFilePath = resolve(logsDir, `${logName}.log`);
const logStream = createWriteStream(logFilePath, { flags: 'a' });
const startedAt = new Date().toISOString();
const env = { ...process.env };

const isVpLintWorkflow =
  command === 'vp' && commandArgs.some((arg) => arg === 'lint' || arg === 'check');

if (process.platform === 'win32' && isVpLintWorkflow) {
  const tsgolintExePath = resolve(process.cwd(), 'node_modules', '.bin', 'tsgolint.exe');

  if (existsSync(tsgolintExePath)) {
    env.OXLINT_TSGOLINT_PATH = tsgolintExePath;
  }
}

logStream.write(`\n=== ${startedAt} :: ${command} ${commandArgs.join(' ')} ===\n`);

const child = spawn(command, commandArgs, {
  cwd: process.cwd(),
  env,
  shell: process.platform === 'win32',
  stdio: ['inherit', 'pipe', 'pipe'],
});

/**
 * Duplica la salida de un stream al terminal y al archivo de log.
 * @param {import('node:stream').Readable} stream
 * @param {NodeJS.WriteStream} writer
 */
const pipeStream = (stream, writer) => {
  stream.on('data', (chunk) => {
    writer.write(chunk);
    logStream.write(chunk);
  });
};

pipeStream(child.stdout, process.stdout);
pipeStream(child.stderr, process.stderr);

child.on('close', (code) => {
  const finishedAt = new Date().toISOString();
  logStream.write(`\n=== ${finishedAt} :: exit ${code ?? 0} ===\n`);
  logStream.end();
  process.exit(code ?? 0);
});

child.on('error', (error) => {
  const finishedAt = new Date().toISOString();
  const message = `\n=== ${finishedAt} :: spawn error ===\n${error.stack ?? String(error)}\n`;
  process.stderr.write(message);
  logStream.write(message);
  logStream.end();
  process.exit(1);
});
