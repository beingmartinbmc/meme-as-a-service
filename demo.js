#!/usr/bin/env node

const { generateMeme, getAvailableTemplates, generateBatchMemes } = require('./dist/index');
const fs = require('fs-extra');
const path = require('path');

async function demo() {
  console.log('🎭 Meme-as-a-Service Demo');
  console.log('========================\n');

  try {
    // Get available templates
    const templates = getAvailableTemplates();
    console.log('📋 Available templates:', templates.join(', '));

    // Create demo directory
    const demoDir = './demo-output';
    await fs.ensureDir(demoDir);

    // Generate individual memes
    console.log('\n🎨 Generating individual memes...');

    const memeConfigs = [
      {
        template: 'drake',
        topText: 'Writing unit tests',
        bottomText: 'Skipping straight to prod',
        filename: 'drake-test-meme.png'
      },
      {
        template: 'doge',
        topText: 'Much code',
        bottomText: 'Very bug',
        filename: 'doge-bug-meme.png'
      },
      {
        template: 'distracted-boyfriend',
        topText: 'My girlfriend',
        bottomText: 'JavaScript',
        filename: 'distracted-js-meme.png'
      },
      {
        template: 'two-buttons',
        topText: 'Write clean code',
        bottomText: 'Ship it anyway',
        filename: 'two-buttons-code-meme.png'
      },
      {
        template: 'change-my-mind',
        topText: 'TypeScript is better than JavaScript',
        filename: 'change-mind-ts-meme.png'
      }
    ];

    for (const config of memeConfigs) {
      console.log(`  Generating ${config.template} meme...`);
      const buffer = await generateMeme({
        template: config.template,
        topText: config.topText,
        bottomText: config.bottomText
      });
      
      const filePath = path.join(demoDir, config.filename);
      await fs.writeFile(filePath, buffer);
      console.log(`  ✅ Saved: ${config.filename}`);
    }

    // Generate batch memes
    console.log('\n🔄 Generating batch memes...');
    
    const batchResult = await generateBatchMemes({
      templates: ['drake', 'doge'],
      texts: [
        { topText: 'Batch meme 1', bottomText: 'Top text' },
        { topText: 'Batch meme 2', bottomText: 'Bottom text' }
      ],
      options: {
        fontSize: 45,
        textColor: '#FFFFFF',
        strokeColor: '#000000',
        strokeWidth: 2
      }
    });

    console.log(`  Generated ${batchResult.successful} memes successfully`);
    console.log(`  Failed: ${batchResult.failed} memes`);

    // Save batch memes
    batchResult.results.forEach((meme, index) => {
      const filename = `batch-meme-${index + 1}.png`;
      const filePath = path.join(demoDir, filename);
      fs.writeFileSync(filePath, meme.buffer);
      console.log(`  ✅ Saved: ${filename} (${meme.template})`);
    });

    console.log('\n🎉 Demo completed successfully!');
    console.log(`📁 Check the '${demoDir}' directory for generated memes.`);
    console.log('\n🚀 Try the CLI:');
    console.log('  npx meme-as-a-service drake -t "Hello" -b "World"');
    console.log('\n🌐 Try the API:');
    console.log('  npx meme-as-a-service api');
    console.log('  curl "http://localhost:3000/meme/drake?top=Hello&bottom=World" --output meme.png');

  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    process.exit(1);
  }
}

// Run demo if this file is executed directly
if (require.main === module) {
  demo();
}

module.exports = { demo };
