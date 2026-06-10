/**
 * Batch-compress images in public/images/
 * Uses buffer-based approach to handle Windows paths with spaces.
 * 
 * Usage: node scripts/compress-images.mjs
 */

import sharp from 'sharp';
import { readdir, stat, mkdir, readFile, writeFile } from 'fs/promises';
import { join, extname, basename, dirname, relative } from 'path';
import { fileURLToPath } from 'url';
import { copyFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', 'public', 'images');
const BACKUP = join(__dirname, '..', 'public', 'images-backup');

// Images that are used as full-screen backgrounds → max 2560px
const HERO_IMAGES = ['benderaPatra.png', 'profile.png', 'Hero Image.png'];

// Small logos/icons → skip compression
const SKIP_IMAGES = ['logo.png', 'image3.png', 'image15.png'];

const DEFAULT_MAX_WIDTH = 800;
const HERO_MAX_WIDTH = 2560;

async function getAllImages(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await getAllImages(fullPath));
    } else {
      const ext = extname(entry.name).toLowerCase();
      if (['.jpg', '.jpeg', '.png'].includes(ext)) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

async function compressImage(filePath) {
  const name = basename(filePath);
  const relPath = relative(ROOT, filePath);
  const stats = await stat(filePath);
  const sizeMB = (stats.size / 1024 / 1024).toFixed(1);
  
  if (stats.size < 500 * 1024) {
    console.log(`  SKIP ${relPath} (${sizeMB}MB — already small)`);
    return { skipped: true, saved: 0 };
  }
  
  if (SKIP_IMAGES.includes(name)) {
    console.log(`  SKIP ${relPath} (icon/logo)`);
    return { skipped: true, saved: 0 };
  }
  
  const maxWidth = HERO_IMAGES.includes(name) ? HERO_MAX_WIDTH : DEFAULT_MAX_WIDTH;
  const quality = HERO_IMAGES.includes(name) ? 85 : 80;
  
  try {
    // Read file into buffer first to avoid path issues on Windows
    const inputBuffer = await readFile(filePath);
    const image = sharp(inputBuffer);
    const metadata = await image.metadata();
    
    if (metadata.width && metadata.width <= maxWidth) {
      console.log(`  SKIP ${relPath} (${metadata.width}px — already ≤ ${maxWidth}px)`);
      return { skipped: true, saved: 0 };
    }
    
    // Backup original
    const backupPath = join(BACKUP, relPath);
    await mkdir(dirname(backupPath), { recursive: true });
    copyFileSync(filePath, backupPath);
    
    // Resize and compress
    const ext = extname(filePath).toLowerCase();
    let pipeline = sharp(inputBuffer).resize(maxWidth, null, { 
      withoutEnlargement: true,
      fit: 'inside'
    });
    
    if (ext === '.png') {
      pipeline = pipeline.png({ quality, compressionLevel: 9 });
    } else {
      pipeline = pipeline.jpeg({ quality, mozjpeg: true });
    }
    
    const outputBuffer = await pipeline.toBuffer();
    await writeFile(filePath, outputBuffer);
    
    const savedMB = ((stats.size - outputBuffer.length) / 1024 / 1024).toFixed(1);
    const newSizeMB = (outputBuffer.length / 1024 / 1024).toFixed(1);
    const pct = ((1 - outputBuffer.length / stats.size) * 100).toFixed(0);
    
    console.log(`  ✅ ${relPath}: ${sizeMB}MB → ${newSizeMB}MB (saved ${savedMB}MB, ${pct}%)`);
    return { skipped: false, saved: stats.size - outputBuffer.length };
  } catch (err) {
    console.error(`  ❌ ${relPath}: ${err.message}`);
    return { skipped: true, saved: 0 };
  }
}

async function main() {
  console.log('🔍 Scanning public/images/ for oversized images...\n');
  
  const files = await getAllImages(ROOT);
  console.log(`Found ${files.length} image files\n`);
  
  let totalSaved = 0;
  let compressed = 0;
  let skipped = 0;
  
  for (const file of files) {
    const result = await compressImage(file);
    if (result.skipped) {
      skipped++;
    } else {
      compressed++;
      totalSaved += result.saved;
    }
  }
  
  console.log(`\n✨ Done!`);
  console.log(`   Compressed: ${compressed} files`);
  console.log(`   Skipped: ${skipped} files`);
  console.log(`   Total saved: ${(totalSaved / 1024 / 1024).toFixed(1)}MB`);
  console.log(`   Backups at: public/images-backup/`);
}

main().catch(console.error);
