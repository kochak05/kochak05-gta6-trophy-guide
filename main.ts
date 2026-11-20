// Leonida Trophy Guide — hand-in program.
//
// Copies the guide (app/) and its screenshots (screenshots/) from this
// repository into the output directory, then writes dossier.json there
// with the kit's dossier library. Node 22 standard library only.
//
// The output directory comes from MAKEFUN_OUTPUT_DIR, or /output when the
// variable is not set. The program never removes that directory itself:
// in the grader it is a mounted volume, and deleting a mount point fails
// the run. It only clears the entries inside it, then writes fresh.
//
// Run it outside the grader with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

// The caps this bounty grades against: the gate's limits for app/,
// screenshots/ and the dossier text.
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
  if (fromEnv && fromEnv.length > 0) return fromEnv;
  return "/output";
}

function emptyContents(dir: string): void {
  // Remove what is inside the directory, never the directory itself.
  for (const entry of readdirSync(dir)) {
    rmSync(join(dir, entry), { recursive: true, force: true });
  }
}

function main(): void {
  const root = repoRoot();
  const out = outputDir();
  mkdirSync(out, { recursive: true });
  emptyContents(out);

  cpSync(join(root, "app"), join(out, "app"), { recursive: true });
  cpSync(join(root, "screenshots"), join(out, "screenshots"), { recursive: true });

  const dossier = buildDossier(out, CAPS);
  const dossierPath = join(out, "dossier.json");
  writeFileSync(dossierPath, dossier);
  console.log("wrote " + dossierPath + " (" + dossier.length + " bytes)");
}

main();
