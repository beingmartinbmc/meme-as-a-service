const { generateMeme, getAvailableTemplates } = require('../dist/index');
const fs = require('fs');

async function basicExample() {
  try {
    console.log('🎭 Meme-as-a-Service Basic Example');
    console.log('===================================');

    // Get available templates
    const templates = getAvailableTemplates();
    console.log('Available templates:', templates);

    // Generate a simple meme
    console.log('\nGenerating Drake meme...');
    const drakeBuffer = await generateMeme({
      template: 'drake',
      topText: 'Writing unit tests',
      bottomText: 'Skipping straight to prod',
    });

    fs.writeFileSync('examples/drake-meme.png', drakeBuffer);
    console.log('✅ Drake meme saved as examples/drake-meme.png');

    // Generate a meme with custom styling
    console.log('\nGenerating custom styled meme...');
    const customBuffer = await generateMeme({
      template: 'distracted-boyfriend',
      topText: 'My girlfriend',
      bottomText: 'JavaScript',
      fontSize: 50,
      textColor: '#FF6B6B',
      strokeColor: '#2C3E50',
      strokeWidth: 3,
    });

    fs.writeFileSync('examples/custom-meme.png', customBuffer);
    console.log('✅ Custom meme saved as examples/custom-meme.png');

    // Generate a Doge meme
    console.log('\nGenerating Doge meme...');
    const dogeBuffer = await generateMeme({
      template: 'doge',
      topText: 'Much code',
      bottomText: 'Very bug',
    });

    fs.writeFileSync('examples/doge-meme.png', dogeBuffer);
    console.log('✅ Doge meme saved as examples/doge-meme.png');

    console.log('\n🎉 All examples generated successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

basicExample();
