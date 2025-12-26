/**
 * Generate PWA icons from SVG
 */

import sharp from 'sharp';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT_DIR = join(__dirname, '..');
const ICONS_DIR = join(ROOT_DIR, 'public', 'assets', 'icons');
const SVG_PATH = join(ROOT_DIR, 'assets', 'icons', 'icon.svg');

const SIZES = [192, 512];

async function generateIcons() {
  if (!existsSync(ICONS_DIR)) {
    mkdirSync(ICONS_DIR, { recursive: true });
  }

  const svgBuffer = readFileSync(SVG_PATH);

  for (const size of SIZES) {
    const outputPath = join(ICONS_DIR, `icon-${size}.png`);

    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(`Generated: icon-${size}.png`);
  }

  console.log('All icons generated successfully!');
}

generateIcons().catch((error) => {
  console.error('Error generating icons:', error);
  process.exit(1);
});
