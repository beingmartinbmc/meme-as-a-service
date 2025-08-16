# Meme-as-a-Service 🎭

A powerful Node.js library + CLI that generates memes dynamically for Slack/Discord bots using templates. Create memes programmatically, via command line, or through a REST API!

## About the Project 📖

Meme-as-a-Service is a comprehensive meme generation toolkit built with TypeScript and Node.js. It provides multiple interfaces for creating memes:

- **Library**: Use as a Node.js module in your applications
- **CLI**: Command-line tool for quick meme generation
- **REST API**: HTTP endpoints for web applications and bots

The project uses Sharp for high-performance image processing and SVG for text rendering, ensuring fast and scalable meme generation.

## Features ✨

- 🎨 **Multiple Templates**: Drake, Distracted Boyfriend, Doge, Two Buttons, Change My Mind, One Does Not Simply
- 📝 **Text Rendering**: Automatic text wrapping, font scaling, and stroke effects
- 🚀 **Multiple Interfaces**: Library, CLI, and REST API
- 🔄 **Batch Generation**: Generate multiple memes at once
- 🎯 **Custom Templates**: Add your own meme templates
- 🎨 **Customization**: Font size, colors, stroke width, and more
- 📦 **TypeScript Support**: Full type definitions included
- ⚙️ **Configuration**: Customizable output directories and default settings

## Dependencies 📦

### Core Dependencies
- **sharp**: High-performance image processing and manipulation
- **commander**: CLI framework for command-line interface
- **express**: Web framework for REST API
- **cors**: Cross-origin resource sharing middleware
- **multer**: File upload handling for custom templates
- **axios**: HTTP client for downloading templates
- **fs-extra**: Enhanced file system operations

### Development Dependencies
- **typescript**: TypeScript compiler and language support
- **@types/node**: TypeScript definitions for Node.js
- **@types/express**: TypeScript definitions for Express
- **jest**: Testing framework
- **ts-jest**: TypeScript support for Jest
- **eslint**: Code linting and formatting

## Installation 📦

### From Source
```bash
git clone https://github.com/beingmartinbmc/meme-as-a-service.git
cd meme-as-a-service
npm install
npm run build
```

### As a Dependency
```bash
npm install meme-as-a-service
```

## How to Generate Memes 🎭

### Step-by-Step Guide

#### Step 1: Installation & Setup
```bash
# Install the package
npm install meme-as-a-service

# Or clone and build from source
git clone https://github.com/beingmartinbmc/meme-as-a-service.git
cd meme-as-a-service
npm install
npm run build

# Download meme templates
npm run setup-real
```

#### Step 2: Choose Your Method

**Option A: Command Line (Quickest)**
```bash
# Generate a meme instantly
npx meme-as-a-service generate drake -t "Writing tests" -b "Skipping tests"

# Save with custom name
npx meme-as-a-service generate drake -t "Hello" -b "World" -o my-meme.png
```

**Option B: Library (For Applications)**
```javascript
const { generateMeme } = require('meme-as-a-service');

const buffer = await generateMeme({
  template: 'drake',
  topText: 'Writing unit tests',
  bottomText: 'Skipping straight to prod'
});

require('fs').writeFileSync('meme.png', buffer);
```

**Option C: REST API (For Web Apps)**
```bash
# Start the API server
npx meme-as-a-service api

# Generate via HTTP
curl "http://localhost:3000/meme/drake?top=Hello&bottom=World" --output meme.png
```

#### Step 3: Customize Your Meme
```bash
# Custom styling
npx meme-as-a-service generate drake \
  -t "Custom text" \
  -b "With style" \
  --font-size 60 \
  --color "#FF6B6B" \
  --stroke "#2C3E50" \
  --stroke-width 3
```

#### Step 4: Add Your Own Templates (Optional)
```bash
# Interactive wizard
npm run template-wizard

# Or command line
npx meme-as-a-service template add -n my-meme -f ./my-image.png
```

### Complete Workflow Example

Here's a complete example of generating memes from start to finish:

#### 1. First Time Setup
```bash
# Install and setup
npm install meme-as-a-service
npm run setup-real

# Verify templates are available
npx meme-as-a-service list
```

#### 2. Generate Your First Meme
```bash
# Simple meme
npx meme-as-a-service generate drake -t "Hello World" -b "It works!"

# Check the generated file
ls -la meme.png
```

#### 3. Explore Available Templates
```bash
# List all templates
npx meme-as-a-service list

# Get details about a specific template
npx meme-as-a-service info doge

# Search for templates
npx meme-as-a-service list --search "drake"
```

#### 4. Customize and Style
```bash
# Custom colors and fonts
npx meme-as-a-service generate drake \
  -t "Custom styling" \
  -b "Looks great!" \
  --font-size 50 \
  --color "#FF6B6B" \
  --stroke "#2C3E50" \
  --stroke-width 3 \
  -o styled-meme.png
```

#### 5. Batch Generation
```bash
# Create a batch file
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

#### 6. Add Custom Templates
```bash
# Use the wizard for easy setup
npm run template-wizard

# Or add programmatically
npx meme-as-a-service template add \
  -n my-meme \
  -f ./my-template.png \
  -d "My custom meme" \
  -t "custom,funny"

# Rebuild to include new template
npm run build

# Use your custom template
npx meme-as-a-service generate my-meme -t "Custom meme" -b "Works great!"
```

#### 7. Use in Your Application
```javascript
const { generateMeme } = require('meme-as-a-service');

// Generate meme for your app
const buffer = await generateMeme({
  template: 'drake',
  topText: 'App integration',
  bottomText: 'Works perfectly!'
});

// Save or send the buffer
require('fs').writeFileSync('app-meme.png', buffer);
```

#### 8. API Integration
```bash
# Start API server
npx meme-as-a-service api

# Use in your web app
curl "http://localhost:3000/meme/drake?top=API&bottom=Integration" \
  --output api-meme.png
```

### Quick Reference Commands

| Command | Description |
|---------|-------------|
| `npx meme-as-a-service generate drake -t "Top" -b "Bottom"` | Generate a simple meme |
| `npx meme-as-a-service list` | List all available templates |
| `npx meme-as-a-service info drake` | Get template details |
| `npx meme-as-a-service batch -f memes.json` | Generate multiple memes |
| `npx meme-as-a-service api` | Start REST API server |
| `npm run template-wizard` | Interactive template creation |
| `npm run coordinate-helper ./image.png` | Get coordinate help |
| `npx meme-as-a-service template add -n name -f file.png` | Add custom template |

### Common Use Cases

**Quick Meme Generation:**
```bash
npx meme-as-a-service generate drake -t "Your text here" -b "Bottom text here"
```

**Custom Styling:**
```bash
npx meme-as-a-service generate drake -t "Custom" -b "Style" --font-size 60 --color "#FF0000"
```

**Batch Processing:**
```bash
npx meme-as-a-service batch -f memes.json -o ./output
```

**API Integration:**
```bash
npx meme-as-a-service api
curl "http://localhost:3000/meme/drake?top=Hello&bottom=World"
```

## Quick Start 🚀

### Setup Templates
```bash
# Download real meme templates
npm run setup-real

# Or create placeholder templates
npm run setup
```

### As a Library

```javascript
const { generateMeme } = require("meme-as-a-service");

(async () => {
  const buffer = await generateMeme({
    template: "drake",
    topText: "Writing unit tests",
    bottomText: "Skipping straight to prod",
  });

  require("fs").writeFileSync("meme.png", buffer);
})();
```

### As a CLI

```bash
# Generate a meme
npx meme-as-a-service generate drake \
  --top "JavaScript devs" \
  --bottom "npm install more packages"

# List available templates
npx meme-as-a-service list

# Get template info
npx meme-as-a-service info drake

# Add custom template (interactive wizard)
npm run template-wizard

# Add custom template (command line)
npx meme-as-a-service template add -n my-meme -f ./my-image.png

# List custom templates
npx meme-as-a-service template list-custom

# Remove custom template
npx meme-as-a-service template remove my-meme
```

### As an API

```bash
# Start the API server
npx meme-as-a-service api

# Generate meme via HTTP
curl "http://localhost:3000/meme/drake?top=Writing%20tests&bottom=Skipping%20tests" \
  --output meme.png
```

## Usage Examples 📚

### Library Usage

```javascript
const { 
  generateMeme, 
  generateMemeWithMetadata,
  generateBatchMemes,
  getAvailableTemplates,
  searchAvailableTemplates,
  getTemplateInfo,
  addCustomTemplate,
  MemeGenerator 
} = require("meme-as-a-service");

// Basic usage - returns buffer
const buffer = await generateMeme({
  template: "drake",
  topText: "Writing unit tests",
  bottomText: "Skipping straight to prod",
});

// Get full result with metadata
const result = await generateMemeWithMetadata({
  template: "drake",
  topText: "Hello",
  bottomText: "World"
});

// With custom styling
const customBuffer = await generateMeme({
  template: "distracted-boyfriend",
  topText: "My girlfriend",
  bottomText: "JavaScript",
  fontSize: 50,
  textColor: "#FF6B6B",
  strokeColor: "#2C3E50",
  strokeWidth: 3,
});

// Batch generation
const batchResult = await generateBatchMemes({
  templates: ['drake', 'doge'],
  texts: [
    { topText: 'Text 1', bottomText: 'Bottom 1' },
    { topText: 'Text 2', bottomText: 'Bottom 2' }
  ],
  options: {
    fontSize: 45,
    textColor: '#FFFFFF'
  }
});

// Get available templates
const templates = getAvailableTemplates();
console.log(templates); // ['drake', 'distracted-boyfriend', 'doge', ...]

// Search templates
const searchResults = searchAvailableTemplates('drake');

// Get template info
const templateInfo = getTemplateInfo('drake');

// Add custom template
await addCustomTemplate(
  'my-meme',
  './my-template.png',
  {
    top: { x: 100, y: 50, width: 400, height: 150 },
    bottom: { x: 100, y: 300, width: 400, height: 150 }
  },
  { description: 'My custom meme', tags: ['custom'] }
);
```

### CLI Usage

```bash
# Basic meme generation
npx meme-as-a-service generate drake -t "Top text" -b "Bottom text"

# Custom output file
npx meme-as-a-service generate drake -t "Hello" -b "World" -o my-meme.png

# Custom styling
npx meme-as-a-service generate drake \
  -t "Custom" \
  -b "Styling" \
  --font-size 60 \
  --color "#FF6B6B" \
  --stroke "#2C3E50" \
  --stroke-width 3

# List templates
npx meme-as-a-service list

# Search templates
npx meme-as-a-service list --search "drake"

# Get template details
npx meme-as-a-service info drake

# Batch generation from JSON file
npx meme-as-a-service batch -f memes.json -o ./output

# Start API server
npx meme-as-a-service api

# Start API server on custom port
npx meme-as-a-service api --port 8080
```

### API Usage

```bash
# Start the server
npx meme-as-a-service api

# Generate meme via GET
curl "http://localhost:3000/meme/drake?top=Hello&bottom=World" \
  --output meme.png

# Generate meme via POST (more options)
curl -X POST "http://localhost:3000/meme/drake" \
  -H "Content-Type: application/json" \
  -d '{
    "topText": "Custom styling",
    "bottomText": "With options",
    "fontSize": 50,
    "textColor": "#FF6B6B"
  }' \
  --output meme.png

# Get available templates
curl "http://localhost:3000/templates"

# Search templates
curl "http://localhost:3000/templates?search=drake"

# Get template info
curl "http://localhost:3000/templates/drake"

# Batch generation
curl -X POST "http://localhost:3000/meme/batch" \
  -H "Content-Type: application/json" \
  -d '{
    "memes": [
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
  }'
```

## Template Management 🎨

### Adding Custom Templates

The system provides multiple ways to add your own meme templates:

#### 1. Interactive Wizard (Easiest)
```bash
npm run template-wizard
```
This guided wizard will help you create templates step-by-step.

#### 2. Command Line
```bash
# Add from local file
npx meme-as-a-service template add -n my-meme -f ./my-image.png

# Add from URL
npx meme-as-a-service template add -n my-meme -u https://example.com/meme.png

# Add with custom text boxes
npx meme-as-a-service template add \
  -n my-meme \
  -f ./my-image.png \
  -x 100 -y 50 -w 400 -h 150 \
  -X 100 -Y 300 -W 400 -H 150

# Add with metadata
npx meme-as-a-service template add \
  -n my-meme \
  -f ./my-image.png \
  -d "My custom meme template" \
  -t "custom,funny,personal"
```

#### 3. Programmatic
```javascript
const { addCustomTemplate } = require('meme-as-a-service');

// Add from file
await addCustomTemplate(
  'my-meme',
  './my-template.png',
  {
    top: { x: 100, y: 50, width: 400, height: 150 },
    bottom: { x: 100, y: 300, width: 400, height: 150 }
  },
  { description: 'My custom meme', tags: ['custom'] }
);
```

### Template Management Commands
```bash
# List custom templates
npx meme-as-a-service template list-custom

# Remove template
npx meme-as-a-service template remove my-meme

# Get coordinate help
npm run coordinate-helper ./my-image.png
```

### Finding Text Box Coordinates
```bash
# Use the coordinate helper
npm run coordinate-helper ./my-image.png
```
This tool provides:
- Image dimensions
- Coordinate guidelines
- Suggested text box positions
- Ready-to-use commands

## Built-in Templates 🎨

The library comes with 6 popular meme templates, each with optimized text positioning:

### Drake Hotline Bling
- **Template**: `drake`
- **Dimensions**: 1200x1200
- **Description**: Drake disapproving/approving meme
- **Text Areas**: Top and bottom text boxes
- **Best For**: Approval/disapproval scenarios, comparisons
- **Tags**: drake, hotline, bling, approval

### Distracted Boyfriend
- **Template**: `distracted-boyfriend`
- **Dimensions**: 1200x800
- **Description**: Distracted boyfriend looking at another woman
- **Text Areas**: Top and bottom text boxes
- **Best For**: Cheating jokes, preference comparisons
- **Tags**: boyfriend, distracted, cheating

### Doge
- **Template**: `doge`
- **Dimensions**: 800x600
- **Description**: Much wow, very doge
- **Text Areas**: Top and bottom text boxes
- **Best For**: Internet humor, casual memes
- **Tags**: doge, shibe, wow

### Two Buttons
- **Template**: `two-buttons`
- **Dimensions**: 800x600
- **Description**: Two buttons decision meme
- **Text Areas**: Top and bottom text boxes
- **Best For**: Decision making, dilemmas
- **Tags**: buttons, decision, dilemma

### Change My Mind
- **Template**: `change-my-mind`
- **Dimensions**: 800x600
- **Description**: Steven Crowder change my mind meme
- **Text Areas**: Top text box only
- **Best For**: Opinions, debates, hot takes
- **Tags**: change, mind, opinion, debate

### One Does Not Simply
- **Template**: `one-does-not-simply`
- **Dimensions**: 800x600
- **Description**: Boromir one does not simply meme
- **Text Areas**: Top and bottom text boxes
- **Best For**: Impossibility jokes, sarcasm
- **Tags**: boromir, lotr, impossible

## Configuration ⚙️

### Configuration File
Create a `meme-config.json` file in your project root:

```json
{
  "outputDirectory": "./memes",
  "defaultFontSize": 40,
  "defaultFontFamily": "Impact",
  "defaultTextColor": "#FFFFFF",
  "defaultStrokeColor": "#000000",
  "defaultStrokeWidth": 2,
  "templatesPath": "./templates"
}
```

### MemeOptions Interface
```typescript
interface MemeOptions {
  template: string;           // Template name
  topText?: string;          // Top text content
  bottomText?: string;       // Bottom text content
  fontSize?: number;         // Font size (default: 40)
  fontFamily?: string;       // Font family (default: Impact)
  textColor?: string;        // Text color (default: #FFFFFF)
  strokeColor?: string;      // Stroke color (default: #000000)
  strokeWidth?: number;      // Stroke width (default: 2)
  maxWidth?: number;         // Maximum text width
  quality?: number;          // Output quality (1-100)
}
```

## API Endpoints 🌐

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/templates` | List all templates |
| GET | `/templates?search=query` | Search templates |
| GET | `/templates/:template` | Get template info |
| GET | `/meme/:template` | Generate meme (query params) |
| POST | `/meme/:template` | Generate meme (JSON body) |
| POST | `/meme/batch` | Generate multiple memes |
| POST | `/templates` | Add custom template |

## Project Structure 📁

```
meme-as-a-service/
├── src/
│   ├── api/           # REST API server
│   │   ├── server.ts  # Express server setup
│   │   └── index.ts   # API entry point
│   ├── config/        # Configuration management
│   │   └── index.ts   # Config manager
│   ├── core/          # Core meme generator
│   │   └── meme-generator.ts
│   ├── templates/     # Template definitions
│   │   └── index.ts   # Template configurations
│   ├── types/         # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/         # Utility functions
│   │   └── text.ts    # Text rendering utilities
│   ├── cli.ts         # CLI interface
│   └── index.ts       # Main library entry
├── templates/         # Template images
├── examples/          # Usage examples
├── scripts/           # Build and setup scripts
├── dist/              # Built JavaScript files
├── package.json       # Project configuration
└── README.md          # This file
```

## Development 🛠️

### Setup

```bash
git clone https://github.com/beingmartinbmc/meme-as-a-service.git
cd meme-as-a-service
npm install
npm run build
npm run setup-real  # Download real meme templates
```

### Available Scripts

```bash
npm run build        # Build TypeScript to JavaScript
npm run dev          # Watch mode for development
npm run test         # Run unit tests
npm run lint         # Lint TypeScript code
npm start            # Start API server
npm run cli          # Run CLI commands
npm run setup        # Create placeholder templates
npm run setup-real   # Download real meme templates
npm run add-templates # Add more built-in templates
npm run template-wizard # Interactive template creation
npm run coordinate-helper # Help with text box coordinates
npm run clean        # Clean build directory
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

## Contributing 🤝

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## Testing 🧪

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test -- --coverage
```

## License 📄

MIT License - see [LICENSE](LICENSE) file for details.

## Roadmap 🚀

- [ ] Template marketplace
- [ ] AI-powered caption generation
- [ ] GIF and video meme support
- [ ] Cloud storage integration
- [ ] Advanced text effects
- [ ] Plugin system
- [ ] Analytics and usage tracking
- [ ] Mobile app support
- [ ] Social media integration
- [ ] Community features

---

**Made with ❤️ for the meme community**
