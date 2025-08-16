#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

// Additional popular meme templates to add
const additionalTemplates = {
  'success-kid': {
    name: 'Success Kid',
    imagePath: 'success-kid.png',
    width: 800,
    height: 600,
    description: 'Success Kid fist pump',
    tags: ['success', 'kid', 'fist', 'pump', 'achievement'],
    textBoxes: {
      top: {
        x: 400,
        y: 50,
        width: 350,
        height: 200,
        fontSize: 35,
        fontFamily: 'Impact',
        textColor: '#FFFFFF',
        strokeColor: '#000000',
        strokeWidth: 2,
        maxWidth: 330
      }
    }
  },
  'philosoraptor': {
    name: 'Philosoraptor',
    imagePath: 'philosoraptor.png',
    width: 800,
    height: 600,
    description: 'Philosoraptor deep thoughts',
    tags: ['philosoraptor', 'philosophy', 'deep', 'thoughts', 'dinosaur'],
    textBoxes: {
      top: {
        x: 400,
        y: 50,
        width: 350,
        height: 200,
        fontSize: 35,
        fontFamily: 'Impact',
        textColor: '#FFFFFF',
        strokeColor: '#000000',
        strokeWidth: 2,
        maxWidth: 330
      },
      bottom: {
        x: 400,
        y: 350,
        width: 350,
        height: 200,
        fontSize: 35,
        fontFamily: 'Impact',
        textColor: '#FFFFFF',
        strokeColor: '#000000',
        strokeWidth: 2,
        maxWidth: 330
      }
    }
  },
  'y-u-no': {
    name: 'Y U No Guy',
    imagePath: 'y-u-no.png',
    width: 800,
    height: 600,
    description: 'Y U No Guy pointing',
    tags: ['y-u-no', 'pointing', 'question', 'why'],
    textBoxes: {
      top: {
        x: 400,
        y: 50,
        width: 350,
        height: 200,
        fontSize: 35,
        fontFamily: 'Impact',
        textColor: '#FFFFFF',
        strokeColor: '#000000',
        strokeWidth: 2,
        maxWidth: 330
      }
    }
  },
  'ancient-aliens': {
    name: 'Ancient Aliens',
    imagePath: 'ancient-aliens.png',
    width: 800,
    height: 600,
    description: 'Ancient Aliens conspiracy theories',
    tags: ['ancient', 'aliens', 'conspiracy', 'theories'],
    textBoxes: {
      top: {
        x: 400,
        y: 50,
        width: 350,
        height: 200,
        fontSize: 35,
        fontFamily: 'Impact',
        textColor: '#FFFFFF',
        strokeColor: '#000000',
        strokeWidth: 2,
        maxWidth: 330
      }
    }
  },
  'bad-luck-brian': {
    name: 'Bad Luck Brian',
    imagePath: 'bad-luck-brian.png',
    width: 800,
    height: 600,
    description: 'Bad Luck Brian unfortunate events',
    tags: ['bad-luck', 'brian', 'unfortunate', 'misfortune'],
    textBoxes: {
      top: {
        x: 400,
        y: 50,
        width: 350,
        height: 200,
        fontSize: 35,
        fontFamily: 'Impact',
        textColor: '#FFFFFF',
        strokeColor: '#000000',
        strokeWidth: 2,
        maxWidth: 330
      },
      bottom: {
        x: 400,
        y: 350,
        width: 350,
        height: 200,
        fontSize: 35,
        fontFamily: 'Impact',
        textColor: '#FFFFFF',
        strokeColor: '#000000',
        strokeWidth: 2,
        maxWidth: 330
      }
    }
  },
  'first-world-problems': {
    name: 'First World Problems',
    imagePath: 'first-world-problems.png',
    width: 800,
    height: 600,
    description: 'First World Problems complaints',
    tags: ['first-world', 'problems', 'complaints', 'privilege'],
    textBoxes: {
      top: {
        x: 400,
        y: 50,
        width: 350,
        height: 200,
        fontSize: 35,
        fontFamily: 'Impact',
        textColor: '#FFFFFF',
        strokeColor: '#000000',
        strokeWidth: 2,
        maxWidth: 330
      }
    }
  }
};

async function addMoreTemplates() {
  console.log('🎭 Adding more meme templates...');
  
  const templatesFile = path.join(__dirname, '../src/templates/index.ts');
  const templatesContent = await fs.readFile(templatesFile, 'utf8');
  
  // Find the end of the MEME_TEMPLATES object
  const endIndex = templatesContent.lastIndexOf('};');
  
  if (endIndex === -1) {
    console.error('❌ Could not find MEME_TEMPLATES object end');
    return;
  }
  
  // Create the new template entries
  let newTemplates = '';
  for (const [key, template] of Object.entries(additionalTemplates)) {
    newTemplates += `  ${key}: ${JSON.stringify(template, null, 4).replace(/"/g, "'")},\n`;
  }
  
  // Insert new templates before the closing brace
  const updatedContent = 
    templatesContent.slice(0, endIndex) + 
    newTemplates + 
    templatesContent.slice(endIndex);
  
  await fs.writeFile(templatesFile, updatedContent);
  
  console.log('✅ Added 6 more templates:');
  Object.keys(additionalTemplates).forEach(template => {
    console.log(`  • ${template}`);
  });
  
  console.log('\n🔄 Rebuild the project: npm run build');
  console.log('📝 Note: You\'ll need to add the actual template images to the templates/ directory');
}

addMoreTemplates().catch(console.error);
