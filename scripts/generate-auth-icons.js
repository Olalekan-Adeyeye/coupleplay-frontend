// Generates flat stroke icons for auth screens (person, mail, lock, camera, palette).
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.join(__dirname, '..', 'assets', 'images', 'icons');

const icons = {
  user: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#7A748C" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>`,
  mail: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#7A748C" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>`,
  lock: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#7A748C" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>`,
  camera: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#7A748C" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>`,
  palette: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#7A748C" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22a10 10 0 1 1 10-10c0 2.2-1.8 4-4 4h-2.4c-1 0-1.6.9-1.4 1.8.1.6.3 1 .3 1.6 0 .9-.7 1.6-1.6 1.6H12z"/>
      <circle cx="7.5" cy="10.5" r="1" fill="#7A748C" stroke="none"/>
      <circle cx="12" cy="7.5" r="1" fill="#7A748C" stroke="none"/>
      <circle cx="16.5" cy="10.5" r="1" fill="#7A748C" stroke="none"/>
    </svg>`,
};

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const [name, svg] of Object.entries(icons)) {
    const out = path.join(OUT_DIR, `${name}.png`);
    await sharp(Buffer.from(svg)).resize(64, 64).png().toFile(out);
    console.log('generated', out);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
