import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Configuration ---
const OUTPUT_DIR = '/Users/Apple/Downloads/ae-images';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_FILE = path.join(__dirname, 'config.json');
const PYTHON_SCRIPT_PATH = path.join(__dirname, 'save-webp.py');
// -------------------

/**
 * Executes a shell command and returns it as a Promise.
 * @param {string} cmd 
 * @returns {Promise<string>}
 */
function execShellCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.warn(error);
        reject(error);
        return;
      }
      if (stderr) {
        console.warn(`Stderr: ${stderr}`);
      }
      resolve(stdout.trim());
    });
  });
}

/**
 * Reads the last used name from the config file.
 * @returns {Promise<string>}
 */
async function getLastUsedName() {
  try {
    if ((await fs.stat(CONFIG_FILE)).isFile()) {
      const data = await fs.readFile(CONFIG_FILE, 'utf-8');
      const config = JSON.parse(data);
      return config.lastName || '';
    }
  } catch (error) {
    // If file doesn't exist or is invalid json, return empty.
    return '';
  }
  return '';
}

/**
 * Saves the last used name to the config file.
 * @param {string} name
 */
async function saveLastUsedName(name) {
  try {
    await fs.writeFile(CONFIG_FILE, JSON.stringify({ lastName: name }));
  } catch (error) {
    console.error('Error saving config file:', error);
  }
}

/**
 * Shows a dialog to the user to get a new file name.
 * @param {string} defaultName
 * @returns {Promise<string|null>}
 */
async function promptForName(defaultName) {
  // Sanitize the default name to escape double quotes for AppleScript
  const sanitizedDefaultName = defaultName.replace(/"/g, '\"');

  const appleScript = `
    tell application (path to frontmost application as text)
      set dialogResult to display dialog "Enter the new name for the file:" with title "File Name" default answer "${sanitizedDefaultName}"
      return text returned of dialogResult
    end tell
  `;
  const command = `osascript -e '${appleScript}'`;

  try {
    const newName = await execShellCommand(command);
    return newName;
  } catch (error) {
    // This error typically happens if the user clicks "Cancel".
    console.log('User cancelled the operation.');
    return null;
  }
}

/**
 * Generates a random 2-character suffix.
 * @returns {string}
 */
function generateRandomSuffix() {
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  return characters.charAt(Math.floor(Math.random() * characters.length)) + characters.charAt(Math.floor(Math.random() * characters.length));
}

/**
 * Main function
 */
async function main() {
  let tempImagePath = '';
  try {
    // 1. Run the python script to save the image from clipboard
    console.log('Checking clipboard for an image...');
    const pythonOutput = await execShellCommand(`python3 "${PYTHON_SCRIPT_PATH}"`);
    
    if (pythonOutput.startsWith('Image saved to:')) {
      tempImagePath = pythonOutput.replace('Image saved to:', '').trim();
      console.log(`Image temporarily saved to: ${tempImagePath}`);
    } else {
      console.log(pythonOutput); // "No image found on the clipboard." or an error
      return;
    }

    // 2. Get the last used name for the dialog default
    const defaultName = await getLastUsedName();

    // 3. Prompt user for the new name
    const newName = await promptForName(defaultName);

    // 4. If user provided a name, proceed with renaming
    if (newName && newName.trim() !== '') {
      const sanitizedNewName = newName.trim().replace(/\//g, '-');
      
      // Save the name for the next run
      await saveLastUsedName(sanitizedNewName);

      const randomSuffix = generateRandomSuffix();
      const fileExtension = path.extname(tempImagePath);
      const newFileName = `${sanitizedNewName}-${randomSuffix}${fileExtension}`;
      const newFilePath = path.join(OUTPUT_DIR, newFileName);

      // 5. Rename the file
      await fs.rename(tempImagePath, newFilePath);
      console.log('✅ Rename successful!');
      console.log(`   New name: ${newFileName}`);

      // The image is already in WebP format.
      console.log('✅ Image saved in WebP format.');
      console.log(`   File: ${newFileName}`);

    } else {
      // If user cancelled or entered nothing, delete the temp file.
      console.log('No name entered. Deleting temporary file.');
      await fs.unlink(tempImagePath);
    }

  } catch (error) {
    console.error('An unexpected error occurred:', error);
    // If an error happens after the image was saved, try to clean up.
    if (tempImagePath) {
      try {
        await fs.access(tempImagePath); // Check if file still exists
        await fs.unlink(tempImagePath);
        console.log(`Cleaned up temporary file: ${tempImagePath}`);
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
    }
  }
}

main();
