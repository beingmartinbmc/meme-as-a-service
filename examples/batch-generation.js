const { generateBatchMemes } = require('../dist/index');
const fs = require('fs');

async function batchExample() {
  try {
    console.log('🎭 Meme-as-a-Service Batch Generation Example');
    console.log('============================================');

    const batchOptions = {
      templates: ['drake', 'doge', 'distracted-boyfriend'],
      texts: [
        {
          topText: 'Writing tests',
          bottomText: 'Skipping tests'
        },
        {
          topText: 'Much code',
          bottomText: 'Very bug'
        },
        {
          topText: 'My girlfriend',
          bottomText: 'JavaScript'
        },
        {
          topText: 'Reading docs',
          bottomText: 'Stack Overflow'
        }
      ],
      options: {
        fontSize: 45,
        textColor: '#FFFFFF',
        strokeColor: '#000000',
        strokeWidth: 2
      }
    };

    console.log('Generating batch memes...');
    const result = await generateBatchMemes(batchOptions);

    console.log(`\n📊 Batch Generation Results:`);
    console.log(`Total requested: ${result.total}`);
    console.log(`Successful: ${result.successful}`);
    console.log(`Failed: ${result.failed}`);

    if (result.errors.length > 0) {
      console.log('\n❌ Errors:');
      result.errors.forEach(error => {
        console.log(`  - ${error.template}: ${error.error}`);
      });
    }

    // Save successful memes
    if (result.results.length > 0) {
      console.log('\n💾 Saving memes...');
      
      // Ensure examples directory exists
      if (!fs.existsSync('examples')) {
        fs.mkdirSync('examples');
      }

      result.results.forEach((meme, index) => {
        const filename = `examples/batch-meme-${index + 1}.png`;
        fs.writeFileSync(filename, meme.buffer);
        console.log(`✅ Saved: ${filename} (${meme.template})`);
      });
    }

    console.log('\n🎉 Batch generation complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

batchExample();
