#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const sharp = require('sharp');

async function coordinateHelper() {
  console.log('🎯 Template Coordinate Helper');
  console.log('=============================\n');

  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node scripts/coordinate-helper.js <image-path>');
    console.log('Example: node scripts/coordinate-helper.js ./my-template.png');
    return;
  }

  const imagePath = args[0];

  if (!await fs.pathExists(imagePath)) {
    console.log(`❌ Image file not found: ${imagePath}`);
    return;
  }

  try {
    // Get image metadata
    const metadata = await sharp(imagePath).metadata();
    
    if (!metadata.width || !metadata.height) {
      console.log('❌ Could not read image dimensions');
      return;
    }

    console.log(`📐 Image Dimensions: ${metadata.width}x${metadata.height}`);
    console.log('\n🎯 Coordinate Guidelines:');
    console.log('• (0,0) is at the top-left corner');
    console.log(`• X ranges from 0 to ${metadata.width}`);
    console.log(`• Y ranges from 0 to ${metadata.height}`);
    console.log('\n📝 Text Box Positioning Tips:');
    console.log('• Top text: Usually in the upper third of the image');
    console.log('• Bottom text: Usually in the lower third of the image');
    console.log('• Center text: X = image_width / 2');
    console.log('• Text width: Usually 60-80% of image width');
    console.log('• Text height: Usually 15-25% of image height');

    // Suggest common positions
    const centerX = Math.floor(metadata.width / 2);
    const topY = Math.floor(metadata.height * 0.1);
    const bottomY = Math.floor(metadata.height * 0.8);
    const textWidth = Math.floor(metadata.width * 0.8);
    const textHeight = Math.floor(metadata.height * 0.15);

    console.log('\n💡 Suggested Coordinates:');
    console.log('Top Text Box:');
    console.log(`  X: ${centerX - Math.floor(textWidth / 2)}`);
    console.log(`  Y: ${topY}`);
    console.log(`  Width: ${textWidth}`);
    console.log(`  Height: ${textHeight}`);
    
    console.log('\nBottom Text Box:');
    console.log(`  X: ${centerX - Math.floor(textWidth / 2)}`);
    console.log(`  Y: ${bottomY}`);
    console.log(`  Width: ${textWidth}`);
    console.log(`  Height: ${textHeight}`);

    console.log('\n🔧 Quick Template Command:');
    console.log(`node dist/cli.js template add -n my-template -f ${imagePath} \\`);
    console.log(`  -x ${centerX - Math.floor(textWidth / 2)} \\`);
    console.log(`  -y ${topY} \\`);
    console.log(`  -w ${textWidth} \\`);
    console.log(`  -h ${textHeight} \\`);
    console.log(`  -X ${centerX - Math.floor(textWidth / 2)} \\`);
    console.log(`  -Y ${bottomY} \\`);
    console.log(`  -W ${textWidth} \\`);
    console.log(`  -H ${textHeight}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

coordinateHelper();
