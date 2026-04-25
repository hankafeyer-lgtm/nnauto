import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const ROOT = resolve(process.cwd());
const OUT_DIR = join(ROOT, "public", "watermark-preview");
const BG = join(ROOT, "public", "hero-bg.webp");

function svgSerifItalic(w, h, text) {
  const fontSize = Math.max(14, Math.round(Math.min(w, h) * 0.048));
  const padX = Math.max(12, Math.round(w * 0.022));
  const padY = Math.max(12, Math.round(h * 0.028));
  const strokeW = Math.max(1, Math.round(fontSize * 0.08));
  const ls = Math.max(1, Math.round(fontSize * 0.08));
  const y = padY + fontSize;
  return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <text x="${padX}" y="${y}"
      font-family="Georgia, 'Times New Roman', serif"
      font-style="italic"
      font-weight="600"
      font-size="${fontSize}"
      letter-spacing="${ls}"
      fill="rgba(255,255,255,0.55)"
      stroke="rgba(0,0,0,0.35)"
      stroke-width="${strokeW}"
      paint-order="stroke fill">${text}</text>
  </svg>`;
}

function svgSansUppercaseTracking(w, h, text) {
  const fontSize = Math.max(12, Math.round(Math.min(w, h) * 0.038));
  const padX = Math.max(14, Math.round(w * 0.025));
  const padY = Math.max(14, Math.round(h * 0.032));
  const strokeW = Math.max(1, Math.round(fontSize * 0.06));
  const ls = Math.max(3, Math.round(fontSize * 0.25));
  const y = padY + fontSize;
  return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <text x="${padX}" y="${y}"
      font-family="Helvetica, 'Helvetica Neue', Arial, sans-serif"
      font-weight="300"
      font-size="${fontSize}"
      letter-spacing="${ls}"
      fill="rgba(255,255,255,0.6)"
      stroke="rgba(0,0,0,0.3)"
      stroke-width="${strokeW}"
      paint-order="stroke fill"
      text-transform="uppercase">${text.toUpperCase()}</text>
  </svg>`;
}

function svgGoldSerif(w, h, text) {
  const fontSize = Math.max(14, Math.round(Math.min(w, h) * 0.05));
  const padX = Math.max(12, Math.round(w * 0.022));
  const padY = Math.max(12, Math.round(h * 0.028));
  const strokeW = Math.max(1, Math.round(fontSize * 0.09));
  const ls = Math.max(1, Math.round(fontSize * 0.06));
  const y = padY + fontSize;
  return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f7e7a6"/>
        <stop offset="0.5" stop-color="#d9b25b"/>
        <stop offset="1" stop-color="#a77c2a"/>
      </linearGradient>
    </defs>
    <text x="${padX}" y="${y}"
      font-family="Georgia, 'Times New Roman', serif"
      font-weight="700"
      font-size="${fontSize}"
      letter-spacing="${ls}"
      fill="url(#gold)"
      fill-opacity="0.85"
      stroke="rgba(0,0,0,0.5)"
      stroke-width="${strokeW}"
      paint-order="stroke fill">${text}</text>
  </svg>`;
}

async function render(name, svg, bgBuf, meta) {
  const out = await sharp(bgBuf)
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .webp({ quality: 85 })
    .toBuffer();
  await writeFile(join(OUT_DIR, `${name}.webp`), out);
  console.log("wrote", name, "(", meta.width, "x", meta.height, ")");
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const resized = await sharp(BG)
    .resize(1200, undefined, { withoutEnlargement: true, fit: "inside" })
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = resized.info;

  const TEXT = "NNAuto.cz";

  await render("v1-serif-italic", svgSerifItalic(w, h, TEXT), resized.data, { width: w, height: h });
  await render("v2-sans-uppercase", svgSansUppercaseTracking(w, h, TEXT), resized.data, { width: w, height: h });
  await render("v3-gold-serif", svgGoldSerif(w, h, TEXT), resized.data, { width: w, height: h });

  console.log("done →", OUT_DIR);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
