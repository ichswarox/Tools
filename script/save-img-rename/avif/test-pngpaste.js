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

async function testPngPaste() {
  const tempImageName = `test_paste_${Date.now()}.png`;
  const tempImagePath = path.join(OUTPUT_DIR, tempImageName);

  try {
    // Create the output directory if it doesn't exist
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    // Use pngpaste to save the clipboard image to a temporary file
    console.log('Testing pngpaste...');
    try {
      await execShellCommand(`pngpaste "${tempImagePath}"`);
      console.log(`Image saved to: ${tempImagePath}`);
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

    // Check the saved image metadata
    const metadata = await sharp(tempImagePath).metadata();
    console.log('Pngpaste output metadata:', metadata);
    
    // Check if the image has an alpha channel
    if (metadata.hasAlpha) {
      console.log('✓ Image has alpha channel (transparency)');
    } else {
      console.log('✗ Image does not have alpha channel (no transparency)');
    }

  } catch (error) {
    console.error(`An error occurred: ${error.message}`);
  } finally {
    // Clean up the temporary image file
    try {
      await fs.unlink(tempImagePath);
      console.log(`Cleaned up temporary file: ${tempImagePath}`);
    } catch (error) {
      // Ignore errors if the file doesn't exist
      if (error.code !== 'ENOENT') {
        console.warn(`Could not clean up temporary file: ${tempImagePath}`);
      }
    }
  }
}

// Run the test
testPngPaste();
