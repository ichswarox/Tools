import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';

// --- Configuration ---
const OUTPUT_DIR = '/Users/Apple/Downloads/ae-images';
// -------------------

/**
 * Executes a shell command and returns it as a Promise.
 * @param {string} cmd
 * @returns {Promise<{stdout: string, stderr: string}>}
 */
function execShellCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

async function compareTransparency() {
  const tempImageName = `compare_test_${Date.now()}.png`;
  const tempImagePath = path.join(OUTPUT_DIR, tempImageName);
  const avifPath = tempImagePath.replace('.png', '.avif');

  try {
    // Create the output directory if it doesn't exist
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    // Use pngpaste to save the clipboard image to a temporary file
    console.log('Capturing clipboard image...');
    try {
      await execShellCommand(`pngpaste "${tempImagePath}"`);
      console.log(`Image saved to: ${tempImagePath}`);
    } catch (error) {
      console.log('An error occurred with pngpaste. This might mean no image is on the clipboard.');
      console.error('--- Pngpaste Error Details ---');
      console.error(error);
      console.error('------------------------------');
      return;
    }

    // Check the input PNG metadata
    const pngMetadata = await sharp(tempImagePath).metadata();
    console.log('Input PNG metadata:', pngMetadata);
    console.log(`Input PNG has alpha: ${pngMetadata.hasAlpha ? 'YES' : 'NO'}`);
    console.log(`Input PNG channels: ${pngMetadata.channels}`);

    // Convert to AVIF
    console.log('Converting to AVIF...');
    await sharp(tempImagePath)
      .ensureAlpha()
      .avif({ quality: 80, chromaSubsampling: '4:4:4' })
      .toFile(avifPath);

    // Check the output AVIF metadata
    const avifMetadata = await sharp(avifPath).metadata();
    console.log('Output AVIF metadata:', avifMetadata);
    console.log(`Output AVIF has alpha: ${avifMetadata.hasAlpha ? 'YES' : 'NO'}`);
    console.log(`Output AVIF channels: ${avifMetadata.channels}`);

    // Compare alpha preservation
    if (pngMetadata.hasAlpha && avifMetadata.hasAlpha) {
      console.log('✓ Alpha channel preserved successfully');
    } else if (!pngMetadata.hasAlpha) {
      console.log('ℹ Input PNG had no alpha channel');
    } else {
      console.log('✗ Alpha channel lost during conversion');
    }

    // Extract alpha channels for visual comparison (if they exist)
    if (pngMetadata.hasAlpha) {
      console.log('Extracting alpha channels for comparison...');
      
      // Extract alpha from PNG
      const pngAlphaPath = tempImagePath.replace('.png', '_png_alpha.png');
      await sharp(tempImagePath)
        .extractChannel('alpha')
        .toFile(pngAlphaPath);
      console.log(`PNG alpha channel saved to: ${pngAlphaPath}`);
      
      // Extract alpha from AVIF
      const avifAlphaPath = avifPath.replace('.avif', '_avif_alpha.png');
      await sharp(avifPath)
        .extractChannel('alpha')
        .toFile(avifAlphaPath);
      console.log(`AVIF alpha channel saved to: ${avifAlphaPath}`);
    }

    console.log(`\nFiles created for comparison:`);
    console.log(`- Original PNG: ${tempImagePath}`);
    console.log(`- Converted AVIF: ${avifPath}`);
    
  } catch (error) {
    console.error(`An error occurred: ${error.message}`);
  }
}

// Run the comparison
compareTransparency();
