const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imageDir = path.join(__dirname, '../src/assets');

// Function to optimize a single image file
async function optimizeImage(filePath) {
  try {
    const image = sharp(filePath);
    const metadata = await image.metadata();
    
    // Skip if not PNG
    if (metadata.format !== 'png') {
      return;
    }

    const outputPath = filePath.replace('.png', '.webp');
    
    await image
      .webp({ quality: 80 })
      .toFile(outputPath);

    const originalSize = fs.statSync(filePath).size;
    const optimizedSize = fs.statSync(outputPath).size;
    const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(2);

    console.log(`Optimized ${path.basename(filePath)}: ${savings}% smaller (converted to WebP)`);
    
    // Remove original PNG if WebP conversion was successful
    fs.unlinkSync(filePath);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

// Process all PNG files in the directory
async function processAllImages() {
  const files = fs.readdirSync(imageDir);
  
  for (const file of files) {
    if (file.endsWith('.png')) {
      const filePath = path.join(imageDir, file);
      await optimizeImage(filePath);
    }
  }
}

processAllImages().catch(console.error); 