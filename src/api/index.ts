import app from './server';

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🎭 Meme-as-a-Service API running on port ${PORT}`);
    console.log(`📖 API Documentation:`);
    console.log(`   GET  /health - Health check`);
    console.log(`   GET  /templates - List all templates`);
    console.log(`   GET  /templates/:template - Get template info`);
    console.log(`   GET  /meme/:template - Generate meme (query params)`);
    console.log(`   POST /meme/:template - Generate meme (JSON body)`);
    console.log(`   POST /meme/batch - Generate multiple memes`);
    console.log(`   POST /templates - Add custom template`);
    console.log(`\n🌐 Server: http://localhost:${PORT}`);
  });
}

export default app;
