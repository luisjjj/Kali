// One-off icon renderer: SVG -> PNGs + multi-size ICO. Run with:
//   node scripts/make-icons.cjs
// Committed output lives in app/ (Next.js file conventions).
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const root = path.join(__dirname, "..");
const svg = fs.readFileSync(path.join(root, "assets", "kali-icon.svg"));

function png(size, dest, background = { r: 255, g: 168, b: 205, alpha: 1 }) {
  return sharp(svg, { density: 512 })
    .resize(size, size, { fit: "contain", background })
    .png()
    .toFile(path.join(root, dest));
}

// ICO container embedding PNGs (Vista+ browsers accept PNG-compressed entries).
function ico(entries) {
  const count = entries.length;
  const header = Buffer.alloc(6 + count * 16);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);
  let offset = header.length;
  const parts = [header];
  entries.forEach(({ size, buf }, i) => {
    header.writeUInt8(size >= 256 ? 0 : size, 6 + i * 16);
    header.writeUInt8(size >= 256 ? 0 : size, 6 + i * 16 + 1);
    header.writeUInt8(0, 6 + i * 16 + 2);
    header.writeUInt8(0, 6 + i * 16 + 3);
    header.writeUInt16LE(1, 6 + i * 16 + 4);
    header.writeUInt16LE(32, 6 + i * 16 + 6);
    header.writeUInt32LE(buf.length, 6 + i * 16 + 8);
    header.writeUInt32LE(offset, 6 + i * 16 + 12);
    offset += buf.length;
    parts.push(buf);
  });
  return Buffer.concat(parts);
}

(async () => {
  await png(180, "app/apple-icon.png");
  await png(192, "public/icon-192.png");
  await png(512, "public/icon-512.png");
  const small = await Promise.all(
    [16, 32, 48].map(async (size) => ({
      size,
      buf: await sharp(svg, { density: 512 }).resize(size, size, { fit: "contain" }).png().toBuffer(),
    }))
  );
  fs.writeFileSync(path.join(root, "app", "favicon.ico"), ico(small));
  fs.copyFileSync(
    path.join(root, "assets", "kali-icon.svg"),
    path.join(root, "app", "icon.svg")
  );
  console.log("icons written: favicon.ico, icon.svg, apple-icon.png, icon-192/512.png");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
