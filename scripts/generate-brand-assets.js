const sharp = require('sharp');
const { join } = require('path');

const dir = join(__dirname, '..', 'assets', 'images');

const EMBLEM = join(dir, 'splash-icon.png');

async function main() {
  // 1. App icon: use the emblem image as-is (1024x1024)
  await sharp(EMBLEM).png().toFile(join(dir, 'icon.png'));
  console.log('✓ icon.png (1024x1024, emblem as-is)');

  // 2. Favicon: 48px version
  await sharp(EMBLEM).resize(48, 48).png().toFile(join(dir, 'favicon.png'));
  console.log('✓ favicon.png (48x48)');

  // 3. Android foreground: emblem in safe zone (432 canvas)
  const fgEmblem = await sharp(EMBLEM).resize({ width: 300, height: 300, fit: 'inside' }).png().toBuffer();
  const fgMeta = await sharp(fgEmblem).metadata();
  await sharp({
    create: { width: 432, height: 432, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([
      {
        input: fgEmblem,
        left: Math.round((432 - fgMeta.width) / 2),
        top: Math.round((432 - fgMeta.height) / 2),
      },
    ])
    .png()
    .toFile(join(dir, 'android-icon-foreground.png'));
  console.log('✓ android-icon-foreground.png');

  // 4. Android monochrome: emblem flattened (white silhouette)
  const mono = await sharp(EMBLEM).resize({ width: 300, height: 300, fit: 'inside' })
    .ensureAlpha()
    .png()
    .toBuffer();
  const monoMeta = await sharp(mono).metadata();
  await sharp({
    create: { width: 432, height: 432, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([
      {
        input: mono,
        left: Math.round((432 - monoMeta.width) / 2),
        top: Math.round((432 - monoMeta.height) / 2),
      },
    ])
    .png()
    .toFile(join(dir, 'android-icon-monochrome.png'));
  console.log('✓ android-icon-monochrome.png');

  console.log('\nDone!');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
