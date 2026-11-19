import { mkdirSync, cpSync, existsSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

// Gate caps from the competition's gate.json: text at most 163840 bytes,
// at most 4 screenshots each at most 262144 bytes, the app at most 993
// files and 50331648 bytes in all, app paths at most 1000 bytes.
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
};

const here = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

mkdirSync(outDir, { recursive: true });
cpSync(join(here, 'app'), join(outDir, 'app'), { recursive: true });
const shots = join(here, 'screenshots');
// Only carry screenshots across when the source directory holds files;
// an empty screenshots/ directory would make buildDossier refuse.
if (existsSync(shots) && readdirSync(shots).length > 0) {
  mkdirSync(join(outDir, 'screenshots'), { recursive: true });
  cpSync(shots, join(outDir, 'screenshots'), { recursive: true });
}
const dossier = buildDossier(outDir, DOSSIER_CAPS);
writeFileSync(join(outDir, 'dossier.json'), dossier);
