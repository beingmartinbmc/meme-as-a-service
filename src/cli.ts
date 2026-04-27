#!/usr/bin/env node

import { Command } from 'commander';
import * as fs from 'fs-extra';
import * as path from 'path';
import { generateMeme, getAvailableTemplates, searchAvailableTemplates, getTemplateInfo } from './index';
import { DynamicTemplateLoader } from './templates/dynamic-loader';
import pkg from '../package.json';

const program = new Command();

program
  .name('meme-as-a-service')
  .description('Generate memes dynamically for Slack/Discord bots using templates')
  .version(pkg.version);

// API server command
program
  .command('api')
  .description('Start the REST API server')
  .option('-p, --port <port>', 'Port to run the server on (default: 3000)')
  .action(async (options) => {
    try {
      const { startServer } = await import('./api');
      const port = parseInt(options.port || process.env.PORT || '3000', 10);
      startServer(port);
    } catch (error) {
      console.error(`Error starting API server: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  });

// Template management commands
program
  .command('template')
  .description('Manage meme templates')
  .addCommand(
    new Command('add')
      .description('Add a new template')
      .option('-n, --name <name>', 'Template name')
      .option('-f, --file <path>', 'Path to template image file')
      .option('-u, --url <url>', 'URL to download template from')
      .option('-d, --description <text>', 'Template description')
      .option('-t, --tags <tags>', 'Comma-separated tags')
      .option('-x, --top-x <x>', 'Top text box X coordinate')
      .option('-y, --top-y <y>', 'Top text box Y coordinate')
      .option('-w, --top-width <width>', 'Top text box width')
      .option('-h, --top-height <height>', 'Top text box height')
      .option('-X, --bottom-x <x>', 'Bottom text box X coordinate')
      .option('-Y, --bottom-y <y>', 'Bottom text box Y coordinate')
      .option('-W, --bottom-width <width>', 'Bottom text box width')
      .option('-H, --bottom-height <height>', 'Bottom text box height')
      .action(async (options) => {
        try {
          const loader = new DynamicTemplateLoader();

          if (!options.name) {
            console.error('❌ Template name is required. Use -n or --name');
            process.exit(1);
          }

          const textBoxes: any = {};

          // Add top text box if coordinates provided
          if (options.topX && options.topY && options.topWidth && options.topHeight) {
            textBoxes.top = {
              x: parseInt(options.topX),
              y: parseInt(options.topY),
              width: parseInt(options.topWidth),
              height: parseInt(options.topHeight),
              fontSize: 40,
              fontFamily: 'Impact',
              textColor: '#FFFFFF',
              strokeColor: '#000000',
              strokeWidth: 2
            };
          }

          // Add bottom text box if coordinates provided
          if (options.bottomX && options.bottomY && options.bottomWidth && options.bottomHeight) {
            textBoxes.bottom = {
              x: parseInt(options.bottomX),
              y: parseInt(options.bottomY),
              width: parseInt(options.bottomWidth),
              height: parseInt(options.bottomHeight),
              fontSize: 40,
              fontFamily: 'Impact',
              textColor: '#FFFFFF',
              strokeColor: '#000000',
              strokeWidth: 2
            };
          }

          const metadata = {
            description: options.description,
            tags: options.tags ? options.tags.split(',').map((tag: string) => tag.trim()) : undefined
          };

          let success = false;

          if (options.url) {
            success = await loader.addTemplateFromUrl({
              name: options.name,
              url: options.url,
              description: options.description
            });
          } else if (options.file) {
            success = await loader.addTemplateFromFile(
              options.name,
              options.file,
              textBoxes,
              metadata
            );
          } else {
            console.error('❌ Either --file or --url is required');
            process.exit(1);
          }

          if (success) {
            console.log(`✅ Template '${options.name}' added successfully!`);
            console.log('🔄 Rebuild the project: npm run build');
          } else {
            console.error(`❌ Failed to add template '${options.name}'`);
            process.exit(1);
          }
        } catch (error) {
          console.error(`❌ Error adding template: ${error instanceof Error ? error.message : String(error)}`);
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('remove')
      .description('Remove a template')
      .argument('<name>', 'Template name to remove')
      .action(async (name) => {
        try {
          const loader = new DynamicTemplateLoader();
          const success = await loader.removeTemplate(name);

          if (success) {
            console.log(`✅ Template '${name}' removed successfully!`);
          } else {
            console.error(`❌ Failed to remove template '${name}'`);
            process.exit(1);
          }
        } catch (error) {
          console.error(`❌ Error removing template: ${error instanceof Error ? error.message : String(error)}`);
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('list-custom')
      .description('List custom templates')
      .action(async () => {
        try {
          const loader = new DynamicTemplateLoader();
          const customTemplates = await loader.listCustomTemplates();

          if (customTemplates.length === 0) {
            console.log('📋 No custom templates found.');
            return;
          }

          console.log('📋 Custom templates:');
          customTemplates.forEach(template => {
            console.log(`  • ${template}`);
          });

          console.log(`\nTotal: ${customTemplates.length} custom template(s)`);
        } catch (error) {
          console.error(`❌ Error listing custom templates: ${error instanceof Error ? error.message : String(error)}`);
          process.exit(1);
        }
      })
  );

// Main meme generation command
program
  .command('generate <template>')
  .alias('gen')
  .description('Generate a meme with the specified template')
  .option('-t, --top <text>', 'Top text for the meme')
  .option('-b, --bottom <text>', 'Bottom text for the meme')
  .option('-o, --output <file>', 'Output file path (default: meme.<format>)')
  .option('-f, --font-size <size>', 'Font size (default: template default)')
  .option('--font-family <family>', 'Font family (default: Impact stack)')
  .option('-c, --color <color>', 'Text color (default: white)')
  .option('-s, --stroke <color>', 'Stroke color (default: black)')
  .option('-w, --stroke-width <width>', 'Stroke width (default: 2)')
  .option('-F, --format <fmt>', 'Output format: png|jpeg|webp|avif (default: png)')
  .option('-q, --quality <quality>', 'Output quality 1-100 (jpeg/webp/avif)')
  .action(async (template, options) => {
    try {
      const format = (options.format || '').toLowerCase() || 'png';
      const memeOptions = {
        template,
        topText: options.top,
        bottomText: options.bottom,
        fontSize: options.fontSize ? parseInt(options.fontSize, 10) : undefined,
        fontFamily: options.fontFamily,
        textColor: options.color,
        strokeColor: options.stroke,
        strokeWidth: options.strokeWidth ? parseInt(options.strokeWidth, 10) : undefined,
        format: format as 'png' | 'jpeg' | 'webp' | 'avif',
        quality: options.quality ? parseInt(options.quality, 10) : undefined
      };

      const buffer = await generateMeme(memeOptions);

      const ext = format === 'jpeg' ? 'jpg' : format;
      const outputPath = options.output || `meme.${ext}`;
      await fs.writeFile(outputPath, buffer);

      console.log(`Meme generated: ${outputPath}`);
    } catch (error) {
      console.error(`Error generating meme: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  });

// List templates command
program
  .command('list')
  .alias('ls')
  .description('List all available templates')
  .option('-s, --search <query>', 'Search templates by query')
  .action(async (options) => {
    try {
      let templates: string[];

      if (options.search) {
        templates = searchAvailableTemplates(options.search);
        console.log(`🔍 Templates matching "${options.search}":`);
      } else {
        templates = getAvailableTemplates();
        console.log('📋 Available templates:');
      }

      if (templates.length === 0) {
        console.log('No templates found.');
        return;
      }

      templates.forEach(template => {
        const info = getTemplateInfo(template);
        if (info) {
          console.log(`  • ${template} - ${info.description || 'No description'}`);
        } else {
          console.log(`  • ${template}`);
        }
      });

      console.log(`\nTotal: ${templates.length} template(s)`);
    } catch (error) {
      console.error(`❌ Error listing templates: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  });

// Template info command
program
  .command('info <template>')
  .description('Show detailed information about a template')
  .action(async (template) => {
    try {
      const info = getTemplateInfo(template);

      if (!info) {
        console.error(`❌ Template '${template}' not found`);
        process.exit(1);
      }

      console.log(`📖 Template: ${info.name}`);
      console.log(`📁 Image: ${info.imagePath}`);
      console.log(`📐 Dimensions: ${info.width}x${info.height}`);

      if (info.description) {
        console.log(`📝 Description: ${info.description}`);
      }

      if (info.tags && info.tags.length > 0) {
        console.log(`🏷️  Tags: ${info.tags.join(', ')}`);
      }

      console.log('\n📦 Text boxes:');
      if (info.textBoxes.top) {
        console.log(`  Top: x=${info.textBoxes.top.x}, y=${info.textBoxes.top.y}, w=${info.textBoxes.top.width}, h=${info.textBoxes.top.height}`);
      }
      if (info.textBoxes.bottom) {
        console.log(`  Bottom: x=${info.textBoxes.bottom.x}, y=${info.textBoxes.bottom.y}, w=${info.textBoxes.bottom.width}, h=${info.textBoxes.bottom.height}`);
      }
    } catch (error) {
      console.error(`❌ Error getting template info: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  });

// Batch generation command
program
  .command('batch')
  .description('Generate multiple memes from a JSON file')
  .option('-f, --file <path>', 'JSON file with meme configurations')
  .option('-o, --output-dir <dir>', 'Output directory (default: ./memes)')
  .action(async (options) => {
    try {
      if (!options.file) {
        console.error('❌ Please specify a JSON file with -f option');
        process.exit(1);
      }

      const configPath = path.resolve(options.file);
      if (!await fs.pathExists(configPath)) {
        console.error(`❌ Config file not found: ${configPath}`);
        process.exit(1);
      }

      const config = await fs.readJson(configPath);
      const outputDir = options.outputDir || './memes';
      await fs.ensureDir(outputDir);

      console.log(`🎭 Generating ${config.length} memes...`);

      for (let i = 0; i < config.length; i++) {
        const memeConfig = config[i];
        const { template, topText, bottomText, output, ...options } = memeConfig;

        try {
          const buffer = await generateMeme({
            template,
            topText,
            bottomText,
            ...options
          });

          const fileName = output || `meme_${i + 1}.png`;
          const outputPath = path.join(outputDir, fileName);
          await fs.writeFile(outputPath, buffer);

          console.log(`✅ Generated: ${fileName}`);
        } catch (error) {
          console.error(`❌ Failed to generate meme ${i + 1}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      console.log(`\n🎉 Batch generation complete! Check the '${outputDir}' directory.`);
    } catch (error) {
      console.error(`❌ Error in batch generation: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  });

// Handle unknown commands
program.on('command:*', () => {
  console.error('Invalid command. Use --help for available commands.');
  process.exit(1);
});

// Parse command line arguments
program.parse();
