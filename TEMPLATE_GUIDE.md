# 🎭 Template Management Guide

This guide shows you how to add, manage, and customize meme templates in meme-as-a-service.

## 📋 Quick Start

### 1. Interactive Template Wizard (Easiest)
```bash
npm run template-wizard
```
This interactive wizard will guide you through creating a template step-by-step.

### 2. Command Line Template Management
```bash
# Add template from local file
node dist/cli.js template add -n my-meme -f ./my-image.png

# Add template from URL
node dist/cli.js template add -n my-meme -u https://example.com/meme.png

# List custom templates
node dist/cli.js template list-custom

# Remove template
node dist/cli.js template remove my-meme
```

## 🎯 Finding Text Box Coordinates

### Coordinate Helper Tool
```bash
npm run coordinate-helper ./my-image.png
```
This tool will:
- Show image dimensions
- Provide coordinate guidelines
- Suggest optimal text box positions
- Generate a ready-to-use command

### Manual Coordinate Calculation
- **Origin**: (0,0) is at the top-left corner
- **X-axis**: Horizontal position (left to right)
- **Y-axis**: Vertical position (top to bottom)
- **Text Box Width**: Usually 60-80% of image width
- **Text Box Height**: Usually 15-25% of image height

## 📝 Template Configuration Options

### Basic Template
```bash
node dist/cli.js template add \
  -n my-meme \
  -f ./my-image.png \
  -d "My custom meme template" \
  -t "custom,funny,personal"
```

### Template with Text Boxes
```bash
node dist/cli.js template add \
  -n my-meme \
  -f ./my-image.png \
  -x 100 -y 50 -w 400 -h 150 \
  -X 100 -Y 300 -W 400 -H 150
```

### Template from URL
```bash
node dist/cli.js template add \
  -n my-meme \
  -u "https://example.com/meme-template.png" \
  -d "Downloaded meme template"
```

## 🔧 Advanced Template Management

### Programmatic Template Addition
```javascript
const { DynamicTemplateLoader } = require('meme-as-a-service');

const loader = new DynamicTemplateLoader();

// Add from file
await loader.addTemplateFromFile(
  'my-meme',
  './my-template.png',
  {
    top: {
      x: 100, y: 50, width: 400, height: 150,
      fontSize: 40, fontFamily: 'Impact',
      textColor: '#FFFFFF', strokeColor: '#000000'
    },
    bottom: {
      x: 100, y: 300, width: 400, height: 150,
      fontSize: 40, fontFamily: 'Impact',
      textColor: '#FFFFFF', strokeColor: '#000000'
    }
  },
  {
    description: 'My custom meme',
    tags: ['custom', 'funny']
  }
);

// Add from URL
await loader.addTemplateFromUrl({
  name: 'my-meme',
  url: 'https://example.com/meme.png',
  description: 'Downloaded meme'
});
```

### Template JSON Structure
```json
{
  "name": "my-meme",
  "imagePath": "my-meme.png",
  "width": 800,
  "height": 600,
  "description": "My custom meme template",
  "tags": ["custom", "funny"],
  "textBoxes": {
    "top": {
      "x": 100,
      "y": 50,
      "width": 400,
      "height": 150,
      "fontSize": 40,
      "fontFamily": "Impact",
      "textColor": "#FFFFFF",
      "strokeColor": "#000000",
      "strokeWidth": 2,
      "maxWidth": 380
    },
    "bottom": {
      "x": 100,
      "y": 300,
      "width": 400,
      "height": 150,
      "fontSize": 40,
      "fontFamily": "Impact",
      "textColor": "#FFFFFF",
      "strokeColor": "#000000",
      "strokeWidth": 2,
      "maxWidth": 380
    }
  }
}
```

## 🎨 Text Box Configuration

### Text Box Properties
- **x, y**: Position coordinates
- **width, height**: Text box dimensions
- **fontSize**: Text size (default: 40)
- **fontFamily**: Font type (default: Impact)
- **textColor**: Text color (default: #FFFFFF)
- **strokeColor**: Outline color (default: #000000)
- **strokeWidth**: Outline thickness (default: 2)
- **maxWidth**: Maximum text width for wrapping

### Common Font Options
- `Impact` - Classic meme font
- `Arial` - Clean and readable
- `Comic Sans MS` - Casual and fun
- `Times New Roman` - Formal
- `Verdana` - Modern and clear

### Color Examples
- White text: `#FFFFFF`
- Black text: `#000000`
- Red text: `#FF0000`
- Blue text: `#0000FF`
- Yellow text: `#FFFF00`

## 📁 File Organization

### Template Storage
```
templates/
├── drake.png              # Built-in templates
├── doge.png
├── custom-templates.json  # Custom template definitions
├── my-meme.png           # Your custom templates
└── another-meme.png
```

### Custom Templates File
The `custom-templates.json` file stores all your custom template definitions and is automatically managed by the system.

## 🚀 Best Practices

### 1. Image Requirements
- **Format**: PNG, JPG, or JPEG
- **Size**: Recommended 800x600 or larger
- **Quality**: High resolution for best results
- **Transparency**: PNG with transparency supported

### 2. Text Box Positioning
- **Top text**: Upper third of image
- **Bottom text**: Lower third of image
- **Center alignment**: X = image_width / 2
- **Adequate spacing**: Leave room for text wrapping

### 3. Template Naming
- Use descriptive names: `success-kid`, `philosoraptor`
- Avoid spaces: use hyphens or underscores
- Keep names short and memorable

### 4. Testing Templates
```bash
# Test your template
node dist/cli.js generate my-meme -t "Test top text" -b "Test bottom text"

# Test with different options
node dist/cli.js generate my-meme -t "Custom font" -f 50 -c "#FF0000"
```

## 🔄 Template Lifecycle

### 1. Create Template
```bash
npm run template-wizard
# or
node dist/cli.js template add -n my-meme -f ./my-image.png
```

### 2. Rebuild Project
```bash
npm run build
```

### 3. Test Template
```bash
node dist/cli.js generate my-meme -t "Test"
```

### 4. Use in Code
```javascript
const { generateMeme } = require('meme-as-a-service');
const buffer = await generateMeme({
  template: 'my-meme',
  topText: 'Hello World',
  bottomText: 'It works!'
});
```

### 5. Remove Template (if needed)
```bash
node dist/cli.js template remove my-meme
```

## 🛠️ Troubleshooting

### Common Issues

**Template not found after adding**
```bash
# Rebuild the project
npm run build
```

**Text not appearing correctly**
- Check coordinates are within image bounds
- Verify text box dimensions are appropriate
- Ensure font size is not too large

**Image not loading**
- Verify image file exists and is readable
- Check image format is supported
- Ensure file path is correct

**Coordinates seem wrong**
```bash
# Use coordinate helper
npm run coordinate-helper ./my-image.png
```

### Getting Help
- Check template info: `node dist/cli.js info my-meme`
- List all templates: `node dist/cli.js list`
- List custom templates: `node dist/cli.js template list-custom`

## 🎯 Examples

### Simple Template
```bash
# Add a basic template
node dist/cli.js template add -n simple-meme -f ./simple.png

# Use it
node dist/cli.js generate simple-meme -t "Hello World"
```

### Complex Template
```bash
# Add template with custom text boxes
node dist/cli.js template add \
  -n complex-meme \
  -f ./complex.png \
  -x 50 -y 30 -w 300 -h 100 \
  -X 50 -Y 200 -W 300 -H 100 \
  -d "Complex meme with two text boxes" \
  -t "complex,detailed,funny"
```

### URL Template
```bash
# Download and add template
node dist/cli.js template add \
  -n url-meme \
  -u "https://imgflip.com/s/meme/Doge.jpg" \
  -d "Doge meme from URL"
```

This guide covers all aspects of template management. Start with the wizard for the easiest experience, then explore the command-line options for more control!
