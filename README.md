# Meme-as-a-Service 🎭

[![npm version](https://img.shields.io/npm/v/meme-as-a-service.svg)](https://www.npmjs.com/package/meme-as-a-service)
[![npm downloads](https://img.shields.io/npm/dm/meme-as-a-service.svg)](https://www.npmjs.com/package/meme-as-a-service)
[![npm license](https://img.shields.io/npm/l/meme-as-a-service.svg)](https://github.com/beingmartinbmc/meme-as-a-service/blob/main/LICENSE)
[![GitHub Actions](https://img.shields.io/github/actions/workflow/status/beingmartinbmc/meme-as-a-service/ci.yml?branch=main)](https://github.com/beingmartinbmc/meme-as-a-service/actions)
[![Node.js Version](https://img.shields.io/node/v/meme-as-a-service.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue.svg)](https://www.typescriptlang.org/)

Generate memes instantly with Node.js! Create memes via command line, library, or REST API.

## ✨ Features

- 🎭 **Multiple Templates** - Drake, Doge, Distracted Boyfriend, and more
- 🖥️ **CLI Interface** - Generate memes from command line
- 📚 **Library API** - Use as a Node.js library
- 🌐 **REST API** - HTTP endpoints for web applications
- 🎨 **Customization** - Font size, colors, stroke effects
- 📦 **Batch Generation** - Create multiple memes at once
- 🔧 **Custom Templates** - Add your own meme templates
- ⚡ **TypeScript** - Full TypeScript support
- 🧪 **Tested** - Comprehensive test coverage

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Choose Your Path](#-choose-your-path)
- [Available Templates](#-available-templates)
- [Customization Options](#-customization-options)
- [Examples](#-examples)
- [Advanced Features](#-advanced-features)
- [Installation](#-installation)
- [Development](#-development)
- [API Reference](#-api-reference)
- [Contributing](#-contributing)
- [License](#-license)
- [Roadmap](#-roadmap)

## 🚀 Quick Start

### Install & Generate Your First Meme
```bash
# Install the package
npm install meme-as-a-service

# Generate a meme instantly
npx meme-as-a-service generate drake -t 'Hello World' -b 'It works!'
npx meme-as-a-service generate doge -t 'Much coding' -b 'Very epic, wow!'
npx meme-as-a-service generate distracted-boyfriend -t 'My code' -b 'Stack Overflow'
```

That's it! Your meme will be saved as `meme.png` in the current directory.

## 🎯 Choose Your Path

### **Option 1: Command Line (Easiest)**
```bash
# Basic memes with different templates
npx meme-as-a-service generate drake -t 'Top text' -b 'Bottom text'
npx meme-as-a-service generate doge -t 'Much wow' -b 'Very template'
npx meme-as-a-service generate two-buttons -t 'Button 1' -b 'Button 2'

# Custom styling
npx meme-as-a-service generate change-my-mind -t 'Custom' -b 'Style' --font-size 60 --color "#FF0000"

# Save with custom name
npx meme-as-a-service generate one-does-not-simply -t 'Hello' -b 'World' -o my-meme.png
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

| Template | Description | Best For | Example |
|----------|-------------|----------|---------|
| `drake` | Drake Hotline Bling | Approval/disapproval | `npx meme-as-a-service generate drake -t 'Good code' -b 'Bad code'` |
| `doge` | Much wow, very doge | Internet humor | `npx meme-as-a-service generate doge -t 'Much coding' -b 'Very epic, wow!'` |
| `distracted-boyfriend` | Distracted boyfriend | Cheating jokes | `npx meme-as-a-service generate distracted-boyfriend -t 'My code' -b 'Stack Overflow'` |
| `two-buttons` | Two buttons meme | Decision making | `npx meme-as-a-service generate two-buttons -t 'Button 1' -b 'Button 2'` |
| `change-my-mind` | Steven Crowder | Opinions/debates | `npx meme-as-a-service generate change-my-mind -t 'Change my mind' -b 'About this topic'` |
| `one-does-not-simply` | Boromir meme | Impossibility jokes | `npx meme-as-a-service generate one-does-not-simply -t 'One does not simply' -b 'Debug production'` |

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

# Generate memes with different templates
npx meme-as-a-service generate drake -t 'Writing tests' -b 'Skipping tests'
npx meme-as-a-service generate doge -t 'Much testing' -b 'Very quality'
npx meme-as-a-service generate distracted-boyfriend -t 'My code' -b 'Stack Overflow'
```

### Library Usage
```javascript
const { generateMeme, getAvailableTemplates } = require('meme-as-a-service');

// Get available templates
const templates = getAvailableTemplates();
console.log(templates); // ['drake', 'doge', 'distracted-boyfriend', ...]

// Generate with custom styling
const buffer = await generateMeme({
  template: 'change-my-mind',
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

# Generate memes with different templates
curl 'http://localhost:3000/meme/drake?top=Hello&bottom=World'
curl 'http://localhost:3000/meme/doge?top=Much&bottom=Wow'
curl 'http://localhost:3000/meme/two-buttons?top=Button1&bottom=Button2'

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
  },
  {
    "template": "distracted-boyfriend",
    "topText": "My code",
    "bottomText": "Stack Overflow"
  },
  {
    "template": "two-buttons",
    "topText": "Button 1",
    "bottomText": "Button 2"
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
