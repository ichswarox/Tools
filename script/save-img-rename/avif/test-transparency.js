import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

// Create a simple PNG with transparency for testing
async function createTestImage() {
  const testPngPath = path.join('/Users/Apple/Downloads/ae-images', 'test_transparent.png');
  
  // Create a 100x100 image with a transparent background and a red square
  await sharp({
    create: {
      width: 100,
      height: 100,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
    }
  })
  .composite([{
    input: {
      create: {
        width: 50,
        height: 50,
        channels: 4,
        background: { r: 255, g: 0, b: 0, alpha: 0.5 } // Semi-transparent red square
      }
    },
    top: 25,
    left: 25
  }])
  .png()
  .toFile(testPngPath);
  
  console.log(`Created test PNG with transparency: ${testPngPath}`);
  return testPngPath;
}

// Test converting PNG to AVIF with transparency
async function testPngToAvif(pngPath) {
  const avifPath = pngPath.replace('.png', '.avif');
  
  try {
    // Check if input PNG has alpha channel
    const metadata = await sharp(pngPath).metadata();
    console.log('Input PNG metadata:', metadata);
    
    // Convert to AVIF with transparency preservation
    await sharp(pngPath)
      .ensureAlpha()
      .avif({ quality: 80, chromaSubsampling: '4:4:4' })
      .toFile(avifPath);
    
    console.log(`Converted to AVIF: ${avifPath}`);
    
    // Check if output AVIF has alpha channel
    const avifMetadata = await sharp(avifPath).metadata();
    console.log('Output AVIF metadata:', avifMetadata);
    
  } catch (error) {
    console.error('Error converting PNG to AVIF:', error);
  }
}

// Run the test
async function runTest() {
  try {
    const testPngPath = await createTestImage();
    await testPngToAvif(testPngPath);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

runTest();
