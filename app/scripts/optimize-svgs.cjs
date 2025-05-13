const { optimize } = require('svgo');
const fs = require('fs');
const path = require('path');

const svgDir = path.join(__dirname, '../src/assets');

// SVGO configuration
const svgoConfig = {
  multipass: true,
  plugins: [
    'preset-default',
    'removeDimensions',
    'removeViewBox',
    {
      name: 'removeAttrs',
      params: {
        attrs: '(fill|stroke)'
      }
    }
  ]
};

// Function to optimize a single SVG file
async function optimizeSvg(filePath) {
  try {
    const svg = fs.readFileSync(filePath, 'utf8');
    const result = optimize(svg, {
      path: filePath,
      ...svgoConfig
    });
    
    if (result.error) {
      console.error(`Error optimizing ${filePath}:`, result.error);
      return;
    }

    const originalSize = Buffer.byteLength(svg, 'utf8');
    const optimizedSize = Buffer.byteLength(result.data, 'utf8');
    const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(2);

    fs.writeFileSync(filePath, result.data);
    console.log(`Optimized ${path.basename(filePath)}: ${savings}% smaller`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

// Process all SVG files in the directory
async function processAllSvgs() {
  const files = fs.readdirSync(svgDir);
  
  for (const file of files) {
    if (file.endsWith('.svg')) {
      const filePath = path.join(svgDir, file);
      await optimizeSvg(filePath);
    }
  }
}

processAllSvgs().catch(console.error); 