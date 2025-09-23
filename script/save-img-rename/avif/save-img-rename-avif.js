/**
 * This script saves an image from the clipboard as an AVIF file with a timestamped name.
 * It is a Node.js conversion of the original Python script `save-avif.py`.
 *
 * Dependencies:
 * 1. sharp: A Node.js image processing library. Install with:
 *    npm install sharp
 *
 * 2. pngpaste: A macOS command-line tool to paste clipboard images. Install with:
 *    brew install pngpaste
 */

import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

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

/**
 * Checks for an image on the clipboard and saves it as an AVIF file
 * in a specified directory with a timestamped filename.
 */
async function saveClipboardImageAsAvif() {
  const tempImageName = `temp_clipboard_${Date.now()}.png`;
  const tempImagePath = path.join(OUTPUT_DIR, tempImageName);

  try {
    // 1. Create the output directory if it doesn't exist
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    // 2. Use pngpaste to save the clipboard image to a temporary file
    console.log('Pasting image from clipboard...');
    try {
      await execShellCommand(`pngpaste "${tempImagePath}"`);
    } catch (error) {
      if (error.message.includes('command not found')) {
        console.error("Error: 'pngpaste' command not found.");
        console.error("Please install it to use this script (e.g., 'brew install pngpaste').");
      } else {
        console.log('An error occurred with pngpaste. This might mean no image is on the clipboard.');
        console.error('--- Pngpaste Error Details ---');
        console.error(error);
        console.error('------------------------------');
      }
      return; // Exit if pngpaste fails
    }

    // 3. Generate a unique filename with the current timestamp
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '').replace('T', '_').slice(0, 15);
    const outputFilename = `clipboard_image_${timestamp}.avif`;
    const outputPath = path.join(OUTPUT_DIR, outputFilename);

    // 4. Use sharp to convert the image to AVIF
    console.log('Converting image to AVIF...');
    
    // Check input image metadata
    const inputMetadata = await sharp(tempImagePath).metadata();
    console.log('Input image metadata:', inputMetadata);
    
    await sharp(tempImagePath)
      .ensureAlpha()
      .avif({ quality: 100, chromaSubsampling: '4:4:4', lossless: true })
      .toFile(outputPath);
    
    // Check output image metadata
    const outputMetadata = await sharp(outputPath).metadata();
    console.log('Output image metadata:', outputMetadata);

    console.log(`✅ Image saved to: ${outputPath}`);

  } catch (error) {
    console.error(`An error occurred: ${error.message}`);
  } finally {
    // 5. Clean up the temporary image file
    try {
      await fs.unlink(tempImagePath);
    } catch (error) {
      // Ignore errors if the file doesn't exist (e.g., if pngpaste failed)
      if (error.code !== 'ENOENT') {
        console.warn(`Could not clean up temporary file: ${tempImagePath}`);
      }
    }
  }
}

// Run the main function
saveClipboardImageAsAvif();
