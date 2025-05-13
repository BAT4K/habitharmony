const { execSync } = require('child_process');
const path = require('path');

console.log('Installing dependencies...');
execSync('npm install', { stdio: 'inherit' });

console.log('\nOptimizing SVGs...');
require('./optimize-svgs.cjs');

console.log('\nOptimizing images...');
require('./optimize-images.cjs');

console.log('\nOptimization complete!'); 