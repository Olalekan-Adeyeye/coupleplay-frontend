const fs = require('fs');

const path = process.argv[2];
const b = fs.readFileSync(path);

const readU16 = (o) => b.readUInt16BE(o);
const readS16 = (o) => b.readInt16BE(o);
const numTables = readU16(4);

let os2off = 0;
let hheaOff = 0;
for (let i = 0; i < numTables; i++) {
  const tag = b.slice(12 + i * 16, 16 + i * 16).toString('ascii');
  if (tag === 'OS/2') os2off = b.readUInt32BE(12 + i * 16 + 8);
  if (tag === 'hhea') hheaOff = b.readUInt32BE(12 + i * 16 + 8);
}

console.log('unitsPerEm:', readU16(os2off + 60));
console.log('OS/2  ascender:', readS16(os2off + 68), 'descender:', readS16(os2off + 70), 'lineGap:', readS16(os2off + 72));
console.log('hhea  ascender:', readS16(hheaOff + 4), 'descender:', readS16(hheaOff + 6), 'lineGap:', readS16(hheaOff + 8));
