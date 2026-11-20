// Leonida Trophy Guide — hand-in program.
//
// Copies the guide (app/) and its screenshots (screenshots/) from this
// repository into the output directory, then writes dossier.json with the
// kit's dossier library. Node 22 standard library only; no install, no build.
//
// Run it outside the grader with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The caps this bounty grades against: the gate's limits for app/,
// screenshots/ and the dossier text. Only text_max_bytes shapes the
// dossier bytes; the rest make the program fail where the scorer would.
const CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
};

function repoRoot(): string {
  return dirname(fileURLToPath(import.meta.url));
}

function outputDir(): string {
  const fromEnv = process.env.MAKEFUN_OUTPUT_DIR;
  return fromEnv && fromEnv.length > 0 ? fromEnv : '/output';
}

function copyTree(from: string, to: string): void {
  if (!existsSync(from)) {
    throw new Error('missing input directory: ' + from);
  }
  cpSync(from, to, { recursive: true });
}

function main(): void {
  const root = repoRoot();
  const out = outputDir();

  // Start from an empty output directory so a stale run cannot leak in.
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });

  copyTree(join(root, 'app'), join(out, 'app'));
  copyTree(join(root, 'screenshots'), join(out, 'screenshots'));

  const dossier = buildDossier(out, CAPS);
  writeFileSync(join(out, 'dossier.json'), dossier);

  console.log('wrote ' + join(out, 'dossier.json') + ' (' + dossier.length + ' bytes)');
}

main();
