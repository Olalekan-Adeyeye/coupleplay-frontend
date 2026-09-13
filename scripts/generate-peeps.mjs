/**
 * Generate 10 fixed Open Peeps bust presets (5 male / 5 female) — STRICTLY Open Peeps.
 * Source: @dicebear/open-peeps (remix of Open Peeps by Pablo Stanley, CC0 1.0).
 * https://www.openpeeps.com/ — vendored locally as PNG, no runtime fetching.
 *
 * Run: node scripts/generate-peeps.mjs
 */
import { createAvatar } from '@dicebear/core';
import * as openPeeps from '@dicebear/open-peeps';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'assets', 'peeps', 'busts');

const PRESETS = [
  // ——— MALE (facial hair forced on, masculine heads) ———
  { id: 'peep-m-01', gender: 'male', seed: 'CouplePlay-m1', options: { head: ['short1'], face: ['smile'], facialHair: ['full'], facialHairProbability: 100, skinColor: ['ffdbb4'] } },
  { id: 'peep-m-02', gender: 'male', seed: 'CouplePlay-m2', options: { head: ['short3'], face: ['calm'], facialHair: ['goatee1'], facialHairProbability: 100, skinColor: ['edb98a'] } },
  { id: 'peep-m-03', gender: 'male', seed: 'CouplePlay-m3', options: { head: ['flatTop'], face: ['cheeky'], facialHair: ['moustache3'], facialHairProbability: 100, skinColor: ['d08b5b'] } },
  { id: 'peep-m-04', gender: 'male', seed: 'CouplePlay-m4', options: { head: ['shaved1'], face: ['serious'], facialHair: ['full2'], facialHairProbability: 100, skinColor: ['ae5d29'] } },
  { id: 'peep-m-05', gender: 'male', seed: 'CouplePlay-m5', options: { head: ['pomp'], face: ['smileBig'], facialHair: ['chin'], facialHairProbability: 100, skinColor: ['694d3d'] } },
  // ——— FEMALE (no facial hair, feminine heads) ———
  { id: 'peep-f-01', gender: 'female', seed: 'CouplePlay-f1', options: { head: ['long'], face: ['smile'], facialHairProbability: 0, skinColor: ['ffdbb4'] } },
  { id: 'peep-f-02', gender: 'female', seed: 'CouplePlay-f2', options: { head: ['buns'], face: ['cute'], facialHairProbability: 0, skinColor: ['edb98a'] } },
  { id: 'peep-f-03', gender: 'female', seed: 'CouplePlay-f3', options: { head: ['mediumBangs'], face: ['lovingGrin1'], facialHairProbability: 0, skinColor: ['d08b5b'] } },
  { id: 'peep-f-04', gender: 'female', seed: 'CouplePlay-f4', options: { head: ['hijab'], face: ['calm'], facialHairProbability: 0, skinColor: ['ae5d29'] } },
  { id: 'peep-f-05', gender: 'female', seed: 'CouplePlay-f5', options: { head: ['bun2'], face: ['smileTeethGap'], facialHairProbability: 0, skinColor: ['694d3d'] } },
];

const BASE = {
  backgroundColor: ['transparent'],
  accessoriesProbability: 0,
  maskProbability: 0,
  size: 512,
};

fs.mkdirSync(OUT, { recursive: true });

for (const p of PRESETS) {
  const svg = createAvatar(openPeeps, { seed: p.seed, ...BASE, ...p.options }).toString();
  const outPath = path.join(OUT, `${p.id}.png`);
  await sharp(Buffer.from(svg)).png().toFile(outPath);
  console.log('wrote', outPath);
}

// Attribution marker (CC0 — no credit required, kept for provenance)
fs.writeFileSync(
  path.join(path.dirname(OUT), 'ATTRIBUTION.md'),
  `# Peeps attribution\n\nBust PNGs generated from [@dicebear/open-peeps](https://www.dicebear.com/styles/open-peeps/), a remix of [Open Peeps](https://www.openpeeps.com/) by Pablo Stanley, licensed under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/).\n\nRegenerate: \`node scripts/generate-peeps.mjs\`. Fixed presets: 5 male (\`peep-m-01…05\`) + 5 female (\`peep-f-01…05\`). No other illustration source is used for people — Open Peeps strictly.\n`,
);
console.log('done:', PRESETS.length, 'presets');
