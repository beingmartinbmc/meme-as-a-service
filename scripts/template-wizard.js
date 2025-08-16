#!/usr/bin/env node

const readline = require('readline');
const fs = require('fs-extra');
const path = require('path');
const { DynamicTemplateLoader } = require('../dist/templates/dynamic-loader');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function templateWizard() {
  console.log('🎭 Meme Template Creation Wizard');
  console.log('================================\n');

  try {
    // Get template name
    const name = await question('Enter template name (e.g., my-meme): ');
    if (!name.trim()) {
      console.log('❌ Template name is required');
      rl.close();
      return;
    }

    // Get template source
    console.log('\n📁 Template Source Options:');
    console.log('1. Local image file');
    console.log('2. Download from URL');
    const sourceChoice = await question('Choose option (1 or 2): ');

    let imagePath = '';
    let url = '';

    if (sourceChoice === '1') {
      imagePath = await question('Enter path to image file: ');
      if (!await fs.pathExists(imagePath)) {
        console.log('❌ Image file not found');
        rl.close();
        return;
      }
    } else if (sourceChoice === '2') {
      url = await question('Enter image URL: ');
      if (!url.trim()) {
        console.log('❌ URL is required');
        rl.close();
        return;
      }
    } else {
      console.log('❌ Invalid choice');
      rl.close();
      return;
    }

    // Get description
    const description = await question('Enter template description (optional): ');

    // Get tags
    const tagsInput = await question('Enter tags (comma-separated, optional): ');
    const tags = tagsInput.trim() ? tagsInput.split(',').map(tag => tag.trim()) : undefined;

    // Text box configuration
    console.log('\n📝 Text Box Configuration:');
    console.log('You can add text boxes for top and/or bottom text.');
    console.log('Leave coordinates empty to skip a text box.\n');

    const textBoxes = {};

    // Top text box
    console.log('Top Text Box (optional):');
    const hasTopText = await question('Add top text box? (y/n): ');
    
    if (hasTopText.toLowerCase() === 'y') {
      const topX = await question('X coordinate: ');
      const topY = await question('Y coordinate: ');
      const topWidth = await question('Width: ');
      const topHeight = await question('Height: ');

      if (topX && topY && topWidth && topHeight) {
        textBoxes.top = {
          x: parseInt(topX),
          y: parseInt(topY),
          width: parseInt(topWidth),
          height: parseInt(topHeight),
          fontSize: 40,
          fontFamily: 'Impact',
          textColor: '#FFFFFF',
          strokeColor: '#000000',
          strokeWidth: 2
        };
      }
    }

    // Bottom text box
    console.log('\nBottom Text Box (optional):');
    const hasBottomText = await question('Add bottom text box? (y/n): ');
    
    if (hasBottomText.toLowerCase() === 'y') {
      const bottomX = await question('X coordinate: ');
      const bottomY = await question('Y coordinate: ');
      const bottomWidth = await question('Width: ');
      const bottomHeight = await question('Height: ');

      if (bottomX && bottomY && bottomWidth && bottomHeight) {
        textBoxes.bottom = {
          x: parseInt(bottomX),
          y: parseInt(bottomY),
          width: parseInt(bottomWidth),
          height: parseInt(bottomHeight),
          fontSize: 40,
          fontFamily: 'Impact',
          textColor: '#FFFFFF',
          strokeColor: '#000000',
          strokeWidth: 2
        };
      }
    }

    // Confirm template creation
    console.log('\n📋 Template Summary:');
    console.log(`Name: ${name}`);
    console.log(`Description: ${description || 'None'}`);
    console.log(`Tags: ${tags ? tags.join(', ') : 'None'}`);
    console.log(`Text Boxes: ${Object.keys(textBoxes).length > 0 ? Object.keys(textBoxes).join(', ') : 'None'}`);

    const confirm = await question('\nCreate this template? (y/n): ');

    if (confirm.toLowerCase() !== 'y') {
      console.log('❌ Template creation cancelled');
      rl.close();
      return;
    }

    // Create template
    const loader = new DynamicTemplateLoader();
    const metadata = { description, tags };

    let success = false;

    if (url) {
      success = await loader.addTemplateFromUrl({
        name,
        url,
        description
      });
    } else {
      success = await loader.addTemplateFromFile(name, imagePath, textBoxes, metadata);
    }

    if (success) {
      console.log(`\n✅ Template '${name}' created successfully!`);
      console.log('🔄 Rebuild the project: npm run build');
      console.log('🎭 Test your template: node dist/cli.js generate ' + name + ' -t "Test"');
    } else {
      console.log(`\n❌ Failed to create template '${name}'`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

// Run the wizard
templateWizard();
