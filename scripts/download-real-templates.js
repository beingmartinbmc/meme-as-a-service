#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

// Create templates directory
const templatesDir = path.join(__dirname, '../templates');
fs.ensureDirSync(templatesDir);

// Meme template URLs (using public meme template images)
const memeTemplates = [
  {
    name: 'drake',
    url: 'https://imgflip.com/s/meme/Drake-Hotline-Bling.jpg',
    width: 1200,
    height: 1200
  },
  {
    name: 'distracted-boyfriend',
    url: 'https://imgflip.com/s/meme/Distracted-Boyfriend.jpg',
    width: 1200,
    height: 800
  },
  {
    name: 'doge',
    url: 'https://imgflip.com/s/meme/Doge.jpg',
    width: 800,
    height: 600
  },
  {
    name: 'two-buttons',
    url: 'https://imgflip.com/s/meme/Two-Buttons.jpg',
    width: 1000,
    height: 600
  },
  {
    name: 'change-my-mind',
    url: 'https://imgflip.com/s/meme/Change-My-Mind.jpg',
    width: 1000,
    height: 600
  },
  {
    name: 'one-does-not-simply',
    url: 'https://imgflip.com/s/meme/One-Does-Not-Simply.jpg',
    width: 800,
    height: 600
  }
];

async function downloadTemplate(template) {
  try {
    console.log(`📥 Downloading ${template.name}...`);
    
    const response = await axios({
      method: 'GET',
      url: template.url,
      responseType: 'arraybuffer',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const filePath = path.join(templatesDir, `${template.name}.png`);
    await fs.writeFile(filePath, response.data);
    
    console.log(`✅ Downloaded: ${template.name}.png`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to download ${template.name}: ${error.message}`);
    return false;
  }
}

async function downloadAllTemplates() {
  console.log('🎭 Downloading real meme template images...');
  console.log('📝 Note: This will replace the placeholder images with actual meme templates.\n');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const template of memeTemplates) {
    const success = await downloadTemplate(template);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    
    // Add a small delay between downloads
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n📊 Download Summary:`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  
  if (successCount > 0) {
    console.log('\n🎉 Real meme templates downloaded successfully!');
    console.log('🔄 You may need to rebuild the project: npm run build');
  } else {
    console.log('\n⚠️  No templates were downloaded. Using fallback method...');
    await createFallbackTemplates();
  }
}

async function createFallbackTemplates() {
  console.log('🎨 Creating improved placeholder templates...');
  
  const sharp = require('sharp');
  
  const templates = [
    { name: 'drake', width: 1200, height: 1200, color: '#FF6B6B', text: 'DRAKE\nHOTLINE BLING' },
    { name: 'distracted-boyfriend', width: 1200, height: 800, color: '#4ECDC4', text: 'DISTRACTED\nBOYFRIEND' },
    { name: 'doge', width: 800, height: 600, color: '#45B7D1', text: 'DOGE\nMUCH WOW' },
    { name: 'two-buttons', width: 1000, height: 600, color: '#96CEB4', text: 'TWO\nBUTTONS' },
    { name: 'change-my-mind', width: 1000, height: 600, color: '#FFEAA7', text: 'CHANGE\nMY MIND' },
    { name: 'one-does-not-simply', width: 800, height: 600, color: '#DDA0DD', text: 'ONE DOES NOT\nSIMPLY' }
  ];
  
  for (const template of templates) {
    const svg = `
      <svg width="${template.width}" height="${template.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${template.color};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${template.color}dd;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)"/>
        <rect x="50" y="50" width="${template.width-100}" height="${template.height-100}" 
              fill="none" stroke="white" stroke-width="5" stroke-dasharray="10,5"/>
        <text x="50%" y="40%" font-family="Impact, Arial, sans-serif" font-size="48" 
              text-anchor="middle" fill="white" stroke="black" stroke-width="2">
          ${template.text.split('\n')[0]}
        </text>
        <text x="50%" y="55%" font-family="Impact, Arial, sans-serif" font-size="48" 
              text-anchor="middle" fill="white" stroke="black" stroke-width="2">
          ${template.text.split('\n')[1]}
        </text>
        <text x="50%" y="75%" font-family="Arial, sans-serif" font-size="16" 
              text-anchor="middle" fill="white" opacity="0.8">
          ${template.width}x${template.height} - TEMPLATE
        </text>
      </svg>
    `;
    
    const buffer = await sharp(Buffer.from(svg))
      .png()
      .toBuffer();
      
    const filePath = path.join(templatesDir, `${template.name}.png`);
    fs.writeFileSync(filePath, buffer);
    
    console.log(`✅ Created: ${template.name}.png`);
  }
  
  console.log('\n🎨 Improved placeholder templates created!');
  console.log('📝 These are still placeholders but look more like actual meme templates.');
  console.log('🔄 You may need to rebuild the project: npm run build');
}

// Run the download
downloadAllTemplates().catch(console.error);
