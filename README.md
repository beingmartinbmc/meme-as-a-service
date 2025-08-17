# Meme-as-a-Service 🎭

Generate memes instantly with Node.js! Create memes via command line, library, or REST API.

## 🚀 Quick Start

### Install & Generate Your First Meme
```bash
# Install the package
npm install meme-as-a-service

# Generate a meme instantly
npx meme-as-a-service generate drake -t 'Hello World' -b 'It works!'
```

That's it! Your meme will be saved as `meme.png` in the current directory.

## 🎯 Choose Your Path

### **Option 1: Command Line (Easiest)**
```bash
# Basic meme
npx meme-as-a-service generate drake -t 'Top text' -b 'Bottom text'

# Custom styling
npx meme-as-a-service generate drake -t 'Custom' -b 'Style' --font-size 60 --color "#FF0000"

# Save with custom name
npx meme-as-a-service generate drake -t 'Hello' -b 'World' -o my-meme.png
```

### **Option 2: Library (For Applications)**
```javascript
const { generateMeme } = require('meme-as-a-service');

const buffer = await generateMeme({
  template: 'drake',
  topText: 'Hello World',
  bottomText: 'It works!'
});

require('fs').writeFileSync('meme.png', buffer);
```

### **Option 3: REST API (For Web Apps)**
```bash
# Start the API server
npx meme-as-a-service api

# Generate via HTTP
curl 'http://localhost:3000/meme/drake?top=Hello&bottom=World' --output meme.png
```

## 📋 Available Templates

| Template | Description | Best For |
|----------|-------------|----------|
| `drake` | Drake Hotline Bling | Approval/disapproval |
| `doge` | Much wow, very doge | Internet humor |
| `distracted-boyfriend` | Distracted boyfriend | Cheating jokes |
| `two-buttons` | Two buttons meme | Decision making |
| `change-my-mind` | Steven Crowder | Opinions/debates |
| `one-does-not-simply` | Boromir meme | Impossibility jokes |

## 🎨 Customization Options

```bash
# Font size
--font-size 60

# Text color
--color "#FF6B6B"

# Stroke (outline) color
--stroke "#2C3E50"

# Stroke width
--stroke-width 3
```

## 📚 Examples

### Basic Usage
```bash
# List all templates
npx meme-as-a-service list

# Get template info
npx meme-as-a-service info drake

# Generate meme
npx meme-as-a-service generate drake -t 'Writing tests' -b 'Skipping tests'
```

### Library Usage
```javascript
const { generateMeme, getAvailableTemplates } = require('meme-as-a-service');

// Get available templates
const templates = getAvailableTemplates();
console.log(templates); // ['drake', 'doge', 'distracted-boyfriend', ...]

// Generate with custom styling
const buffer = await generateMeme({
  template: 'doge',
  topText: 'Much library',
  bottomText: 'Very test',
  fontSize: 50,
  textColor: '#FF6B6B',
  strokeColor: '#2C3E50',
  strokeWidth: 3
});
```

### API Usage
```bash
# Start server
npx meme-as-a-service api

# Generate meme
curl 'http://localhost:3000/meme/drake?top=Hello&bottom=World'

# Get templates
curl "http://localhost:3000/templates"
```

## 🔧 Advanced Features

### Batch Generation
```bash
# Create batch file
cat > memes.json << EOF
[
  {
    "template": "drake",
    "topText": "Meme 1",
    "bottomText": "Top text"
  },
  {
    "template": "doge",
    "topText": "Meme 2",
    "bottomText": "Bottom text"
  }
]
EOF

# Generate multiple memes
npx meme-as-a-service batch -f memes.json -o ./memes
```

### Custom Templates
```bash
# Interactive wizard
npm run template-wizard

# Command line
npx meme-as-a-service template add -n my-meme -f ./my-image.png

# List custom templates
npx meme-as-a-service template list-custom
```

## 📦 Installation

### For Users
```bash
npm install meme-as-a-service
```

### For Developers
```bash
git clone https://github.com/beingmartinbmc/meme-as-a-service.git
cd meme-as-a-service
npm install
npm run build
npm run setup-real
```

## 🛠️ Development

### Available Scripts
```bash
npm run build        # Build TypeScript
npm run test         # Run tests
npm run api          # Start API server
npm run template-wizard # Interactive template creation
```

### Project Structure
```
src/
├── api/           # REST API server
├── core/          # Core meme generator
├── templates/     # Template definitions
├── types/         # TypeScript types
├── utils/         # Utility functions
├── cli.ts         # CLI interface
└── index.ts       # Main library entry
```

## 📖 API Reference

### Library Functions
- `generateMeme(options)` - Generate a meme
- `generateMemeWithMetadata(options)` - Generate with full metadata
- `generateBatchMemes(options)` - Generate multiple memes
- `getAvailableTemplates()` - Get template list
- `searchAvailableTemplates(query)` - Search templates
- `getTemplateInfo(name)` - Get template details
- `addCustomTemplate(name, path, textBoxes, metadata)` - Add custom template

### CLI Commands
- `generate <template>` - Generate meme
- `list` - List templates
- `info <template>` - Get template info
- `batch -f <file>` - Batch generation
- `api` - Start REST API
- `template add/remove/list-custom` - Manage templates

### API Endpoints
- `GET /meme/:template` - Generate meme
- `POST /meme/:template` - Generate with options
- `GET /templates` - List templates
- `GET /templates/:template` - Get template info
- `POST /meme/batch` - Batch generation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🚀 Roadmap

- [ ] Template marketplace
- [ ] AI-powered caption generation
- [ ] GIF and video meme support
- [ ] Cloud storage integration
- [ ] Advanced text effects
- [ ] Plugin system

---

**Made with ❤️ for the meme community**

**Author**: Ankit Sharma  
**GitHub**: https://github.com/beingmartinbmc/meme-as-a-service  
**npm**: https://www.npmjs.com/package/meme-as-a-service
