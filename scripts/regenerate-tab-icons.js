/**
 * Regenerates tab bar icon PNGs (1x/2x/3x) from the lucide SVGs in
 * assets/images/tabIcons with normalized glyph sizing and centering.
 *
 * Each glyph is trimmed to its opaque bounds, scaled so its larger
 * dimension matches a shared optical target, then centered on a uniform
 * canvas. This keeps all four tab icons balanced and aligned.
 */
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ICON_DIR = path.join(__dirname, '..', 'assets', 'images', 'tabIcons');
const NAMES = ['home', 'games', 'activity', 'us'];

const CANVAS = 26; // base (1x) canvas size
const TARGET = 21; // glyph max dimension at 1x
const SS = 4; // supersampling factor for clean resampling

async function normalize(name) {
  const svgBuf = fs.readFileSync(path.join(ICON_DIR, `${name}.svg`));

  // 1. Render SVG at high resolution and trim transparent borders.
  const rendered = await sharp(svgBuf, { density: 72 * SS }).png().toBuffer();
  const trimmed = await sharp(rendered).trim().png().toBuffer();
  const meta = await sharp(trimmed).metadata();

  // 2. Scale so the larger glyph dimension matches the target.
  const scale = (TARGET * SS) / Math.max(meta.width, meta.height);
  const w = Math.round(meta.width * scale);
  const h = Math.round(meta.height * scale);
  const resized = await sharp(trimmed).resize(w, h).toBuffer();

  // 3. Center on the supersampled canvas.
  const canvas = CANVAS * SS;
  const left = Math.round((canvas - w) / 2);
  const top = Math.round((canvas - h) / 2);
  const padded = await sharp({
    create: {
      width: canvas,
      height: canvas,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: resized, left, top }])
    .png()
    .toBuffer();

  // 4. Write 1x/2x/3x outputs.
  for (const [suffix, factor] of [
    ['', 1],
    ['@2x', 2],
    ['@3x', 3],
  ]) {
    const size = CANVAS * factor;
    await sharp(padded)
      .resize(size, size)
      .png()
      .toFile(path.join(ICON_DIR, `${name}${suffix}.png`));
  }
  console.log(
    `✓ ${name}.png  glyph ${(w / SS).toFixed(1)}x${(h / SS).toFixed(1)} on ${CANVAS}x${CANVAS}`,
  );
}

(async () => {
  for (const name of NAMES) await normalize(name);
  console.log('\nDone! Tab icons regenerated with normalized alignment.');
})();
