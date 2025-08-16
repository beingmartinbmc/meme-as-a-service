# 🎭 How to Generate Memes - Quick Guide

## Simple Steps to Generate Memes

### Step 1: Install & Setup
```bash
# Install the package
npm install meme-as-a-service

# Download meme templates
npm run setup-real
```

### Step 2: Generate Your First Meme
```bash
# Basic meme generation
npx meme-as-a-service generate drake -t "Top text" -b "Bottom text"

# Save with custom name
npx meme-as-a-service generate drake -t "Hello" -b "World" -o my-meme.png
```

### Step 3: Explore Templates
```bash
# See all available templates
npx meme-as-a-service list

# Get template details
npx meme-as-a-service info drake
```

### Step 4: Customize Your Meme
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

## Available Templates

- **drake** - Drake Hotline Bling (approval/disapproval)
- **distracted-boyfriend** - Distracted boyfriend meme
- **doge** - Much wow, very doge
- **two-buttons** - Two buttons decision meme
- **change-my-mind** - Steven Crowder change my mind
- **one-does-not-simply** - Boromir one does not simply

## Quick Commands

| What you want to do | Command |
|-------------------|---------|
| Generate a simple meme | `npx meme-as-a-service generate drake -t "Top" -b "Bottom"` |
| List all templates | `npx meme-as-a-service list` |
| Get template info | `npx meme-as-a-service info drake` |
| Custom styling | `npx meme-as-a-service generate drake -t "Text" -b "Text" --font-size 50 --color "#FF0000"` |
| Save with custom name | `npx meme-as-a-service generate drake -t "Text" -b "Text" -o my-meme.png` |
| Start API server | `npx meme-as-a-service api` |

## Examples

### Basic Meme
```bash
npx meme-as-a-service generate drake -t "Writing tests" -b "Skipping tests"
```

### Styled Meme
```bash
npx meme-as-a-service generate drake \
  -t "Custom styling" \
  -b "Looks great!" \
  --font-size 60 \
  --color "#FF6B6B" \
  --stroke "#2C3E50" \
  --stroke-width 3 \
  -o styled-meme.png
```

### Different Template
```bash
npx meme-as-a-service generate doge -t "Much wow" -b "Very meme"
```

## That's it! 🎉

You now know how to generate memes with meme-as-a-service. The generated files will be saved in your current directory.

For more advanced features like custom templates, batch generation, or API usage, check the main README.md file.
