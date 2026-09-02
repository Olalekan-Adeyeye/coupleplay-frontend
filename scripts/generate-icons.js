const { writeFileSync, mkdirSync } = require('fs');
const { join } = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeB = Buffer.from(type, 'ascii');
  const crcInput = Buffer.concat([typeB, data]);
  const crcVal = Buffer.alloc(4);
  crcVal.writeUInt32BE(crc32(crcInput));
  return Buffer.concat([len, typeB, data, crcVal]);
}

function generatePNG(width, height, pixels) {
  const rawData = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    rawData[y * (width * 4 + 1)] = 0;
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const outIdx = y * (width * 4 + 1) + 1 + x * 4;
      rawData[outIdx] = pixels[idx];
      rawData[outIdx + 1] = pixels[idx + 1];
      rawData[outIdx + 2] = pixels[idx + 2];
      rawData[outIdx + 3] = pixels[idx + 3];
    }
  }
  const compressed = zlib.deflateSync(rawData);
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', (() => { const d = Buffer.alloc(13); d.writeUInt32BE(width, 0); d.writeUInt32BE(height, 4); d[8] = 8; d[9] = 6; d[10] = 0; d[11] = 0; d[12] = 0; return d; })()),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// Anti-aliased shape renderer with 3x3 supersampling
function renderLayer(w, h, bgR, bgG, bgB, shapeFn, fgR, fgG, fgB) {
  const pixels = Buffer.alloc(w * h * 4);
  const ss = 3; // supersampling factor

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let count = 0;
      for (let sy = 0; sy < ss; sy++) {
        for (let sx = 0; sx < ss; sx++) {
          const nx = (x + (sx + 0.5) / ss) / w;
          const ny = (y + (sy + 0.5) / ss) / h;
          if (shapeFn(nx, ny)) count++;
        }
      }
      const alpha = count / (ss * ss);
      const idx = (y * w + x) * 4;
      pixels[idx] = Math.round(bgR * (1 - alpha) + fgR * alpha);
      pixels[idx + 1] = Math.round(bgG * (1 - alpha) + fgG * alpha);
      pixels[idx + 2] = Math.round(bgB * (1 - alpha) + fgB * alpha);
      pixels[idx + 3] = 255;
    }
  }
  return pixels;
}

function solidFill(w, h, r, g, b) {
  const pixels = Buffer.alloc(w * h * 4);
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = r; pixels[i + 1] = g; pixels[i + 2] = b; pixels[i + 3] = 255;
  }
  return pixels;
}

// ---- HEART SHAPE ----
function heartFn(x, y) {
  const cx = x - 0.5;
  const cy = y - 0.38;
  const scale = 1.15;
  const xx = cx * scale;
  const yy = cy * scale;
  return (xx * xx + yy * yy - 0.045) ** 3 - xx * xx * yy * yy * yy < 0;
}

// ---- TAB ICON SHAPES ----
// Home: house with roof, door, chimney
function homeFn(x, y) {
  if (x < 0.05 || x > 0.95 || y < 0.05 || y > 0.95) return false;
  // Chimney
  if (x > 0.62 && x < 0.72 && y > 0.08 && y < 0.3) return true;
  // Roof
  const roofY = 0.55 - Math.abs(x - 0.5) * 0.95;
  if (y < roofY && y > 0.15 && x > 0.08 && x < 0.92) return true;
  // Walls
  if (y > 0.42 && y < 0.95 && x > 0.2 && x < 0.8) return true;
  // Door
  if (y > 0.6 && y < 0.95 && x > 0.42 && x < 0.58) return true;
  // Door knob
  const dk = Math.sqrt((x - 0.54) ** 2 + (y - 0.78) ** 2);
  if (dk < 0.03) return true;
  // Windows
  if (y > 0.5 && y < 0.65 && x > 0.25 && x < 0.35) return true;
  if (y > 0.5 && y < 0.65 && x > 0.65 && x < 0.75) return true;
  return false;
}

// Games: controller/gamepad
function gamesFn(x, y) {
  if (x < 0.05 || x > 0.95 || y < 0.05 || y > 0.95) return false;
  // Body
  if (y > 0.3 && y < 0.85 && x > 0.2 && x < 0.8) return true;
  // Left grip
  if (y > 0.7 && y < 0.95 && x > 0.1 && x < 0.35) return true;
  // Right grip
  if (y > 0.7 && y < 0.95 && x > 0.65 && x < 0.9) return true;
  // D-pad
  const dp = Math.sqrt((x - 0.38) ** 2 + (y - 0.5) ** 2);
  if (dp < 0.13 && y > 0.3 && y < 0.7) return true;
  if (Math.abs(x - 0.38) < 0.04 && y > 0.38 && y < 0.62) return true;
  if (Math.abs(y - 0.5) < 0.04 && x > 0.26 && x < 0.5) return true;
  // Right buttons
  const b1 = Math.sqrt((x - 0.6) ** 2 + (y - 0.42) ** 2);
  const b2 = Math.sqrt((x - 0.66) ** 2 + (y - 0.55) ** 2);
  if (b1 < 0.06 || b2 < 0.06) return true;
  return false;
}

// Activity: heartbeat line
function activityFn(x, y) {
  if (x < 0.05 || x > 0.95 || y < 0.05 || y > 0.95) return false;
  const p = x < 0.25 ? 1 : x < 0.38 ? 0 : x < 0.5 ? 1 : x < 0.62 ? 0 : 1;
  let ey;
  if (x < 0.25) ey = 0.5;
  else if (x < 0.33) ey = 0.5 - (x - 0.25) / 0.08 * 0.45; // up
  else if (x < 0.38) ey = 0.05 + (x - 0.33) / 0.05 * 0.45; // down sharp
  else if (x < 0.42) ey = 0.5 - (x - 0.38) / 0.04 * 0.1; // small up
  else if (x < 0.46) ey = 0.4 + (x - 0.42) / 0.04 * 0.1; // small down
  else if (x < 0.54) ey = 0.5 - (x - 0.46) / 0.08 * 0.45; // big up
  else if (x < 0.62) ey = 0.05 + (x - 0.54) / 0.08 * 0.45; // big down
  else ey = 0.5;
  return Math.abs(y - ey) < 0.055;
}

// Us: two person silhouettes
function usFn(x, y) {
  if (x < 0.05 || x > 0.95 || y < 0.05 || y > 0.95) return false;
  // Left person
  const lh = Math.sqrt((x - 0.32) ** 2 + (y - 0.3) ** 2);
  if (lh < 0.14) return true;
  if (x > 0.2 && x < 0.44 && y > 0.42 && y < 0.7) return true;
  // Left legs
  if (x > 0.22 && x < 0.38 && y > 0.7 && y < 0.92) return true;
  // Right person
  const rh = Math.sqrt((x - 0.68) ** 2 + (y - 0.3) ** 2);
  if (rh < 0.14) return true;
  if (x > 0.56 && x < 0.8 && y > 0.42 && y < 0.7) return true;
  if (x > 0.62 && x < 0.78 && y > 0.7 && y < 0.92) return true;
  return false;
}

// ---- ROUNDED RECT ----
function roundedRectFn(x, y, r) {
  if (x < r || x > 1 - r) {
    if (y < r || y > 1 - r) {
      const cx = x < 0.5 ? r : 1 - r;
      const cy = y < 0.5 ? r : 1 - r;
      return Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) < r;
    }
    return true;
  }
  return y >= 0 && y <= 1;
}

const imagesDir = join(__dirname, '..', 'assets', 'images');
mkdirSync(join(imagesDir, 'tabIcons'), { recursive: true });

const rose = { r: 255, g: 77, b: 106 };
const white = { r: 255, g: 255, b: 255 };

// App icon: rounded square with gradient-ish layered background + white heart
{
  let pixels = solidFill(1024, 1024, 255, 77, 106);
  // Add slight radial gradient feel by overlaying a subtle lighter center
  pixels = renderLayer(1024, 1024, 255, 77, 106,
    (x, y) => Math.sqrt((x - 0.5) ** 2 + (y - 0.5) ** 2) < 0.55,
    255, 100, 125);
  // White heart
  pixels = renderLayer(1024, 1024, 255, 77, 106,
    (x, y) => heartFn(x, y),
    255, 255, 255);
  writeFileSync(join(imagesDir, 'icon.png'), generatePNG(1024, 1024, pixels));
  console.log('✓ icon.png (1024x1024)');
}

// Splash: rose bg + white heart
{
  const pixels = renderLayer(256, 256, 255, 77, 106,
    (x, y) => heartFn((x - 0.5) * 0.9 + 0.5, (y - 0.5) * 0.9 + 0.5),
    255, 255, 255);
  writeFileSync(join(imagesDir, 'splash-icon.png'), generatePNG(256, 256, pixels));
  console.log('✓ splash-icon.png (256x256)');
}

// Android foreground: white heart on transparent
{
  const pixels = renderLayer(432, 432, 0, 0, 0,
    (x, y) => heartFn(x, y),
    255, 255, 255);
  writeFileSync(join(imagesDir, 'android-icon-foreground.png'), generatePNG(432, 432, pixels));
  console.log('✓ android-icon-foreground.png (432x432)');
}

// Android background: solid rose
{
  writeFileSync(join(imagesDir, 'android-icon-background.png'), generatePNG(432, 432, solidFill(432, 432, 255, 77, 106)));
  console.log('✓ android-icon-background.png (432x432)');
}

// Android monochrome: white heart on rose
{
  const pixels = renderLayer(432, 432, 255, 77, 106,
    (x, y) => heartFn(x, y),
    255, 255, 255);
  writeFileSync(join(imagesDir, 'android-icon-monochrome.png'), generatePNG(432, 432, pixels));
  console.log('✓ android-icon-monochrome.png (432x432)');
}

// Favicon
{
  const pixels = renderLayer(48, 48, 255, 77, 106,
    (x, y) => heartFn((x - 0.5) * 0.95 + 0.5, (y - 0.5) * 0.9 + 0.5),
    255, 255, 255);
  writeFileSync(join(imagesDir, 'favicon.png'), generatePNG(48, 48, pixels));
  console.log('✓ favicon.png (48x48)');
}

// Tab icons
const tabFns = { home: homeFn, games: gamesFn, activity: activityFn, us: usFn };
const sizes = [24, 48, 72];
const suffixes = ['', '@2x', '@3x'];

for (const [name, fn] of Object.entries(tabFns)) {
  sizes.forEach((size, i) => {
    const pixels = renderLayer(size, size, 0, 0, 0, fn, 255, 77, 106);
    writeFileSync(join(imagesDir, 'tabIcons', `${name}${suffixes[i]}.png`), generatePNG(size, size, pixels));
  });
  console.log(`✓ ${name}.png (24/48/72)`);
}

console.log('\nDone!');
