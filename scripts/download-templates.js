#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

// Create templates directory
const templatesDir = path.join(__dirname, '../templates');
fs.ensureDirSync(templatesDir);

// Create placeholder template images (simple colored rectangles)
const sharp = require('sharp');

const templates = [
  { name: 'drake', width: 1200, height: 1200, color: '#FF6B6B' },
  { name: 'distracted-boyfriend', width: 1200, height: 800, color: '#4ECDC4' },
  { name: 'doge', width: 800, height: 600, color: '#45B7D1' },
  { name: 'two-buttons', width: 1000, height: 600, color: '#96CEB4' },
  { name: 'change-my-mind', width: 1000, height: 600, color: '#FFEAA7' },
  { name: 'one-does-not-simply', width: 800, height: 600, color: '#DDA0DD' }
];

console.log('🎨 Creating placeholder template images...');

templates.forEach(async (template) => {
  // Create a simple colored background
  const svg = `
    <svg width="${template.width}" height="${template.height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${template.color}"/>
      <text x="50%" y="45%" font-family="Arial, sans-serif" font-size="48" text-anchor="middle" fill="white">
        ${template.name.toUpperCase()}
      </text>
      <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="24" text-anchor="middle" fill="white">
        ${template.width}x${template.height}
      </text>
    </svg>
  `;
  
  const buffer = await sharp(Buffer.from(svg))
    .png()
    .toBuffer();
    
  const filePath = path.join(templatesDir, `${template.name}.png`);
  fs.writeFileSync(filePath, buffer);
  
  console.log(`✅ Created: ${template.name}.png (${template.width}x${template.height})`);
});

console.log('\n🎉 All placeholder templates created successfully!');
console.log('📝 Note: These are placeholder images. Replace with actual meme templates for production use.');
