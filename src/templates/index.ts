import * as fs from 'fs';
import * as path from 'path';
import { MemeTemplate } from '../types';

export const BUILTIN_MEME_TEMPLATES: Record<string, MemeTemplate> = {
  drake: {
    name: 'Drake Hotline Bling',
    imagePath: 'drake.png',
    width: 1200,
    height: 1200,
    description: 'Drake disapproving/approving meme',
    tags: ['drake', 'hotline', 'bling', 'approval'],
    textBoxes: {
      top: {
        x: 600,
        y: 100,
        width: 500,
        height: 400,
        fontSize: 60,
        fontFamily: 'Impact',
        textColor: '#FFFFFF',
        strokeColor: '#000000',
        strokeWidth: 3,
        maxWidth: 450
      },
      bottom: {
        x: 600,
        y: 700,
        width: 500,
        height: 400,
        fontSize: 60,
        fontFamily: 'Impact',
        textColor: '#FFFFFF',
        strokeColor: '#000000',
        strokeWidth: 3,
        maxWidth: 450
      }
    }
  },
  'distracted-boyfriend': {
    name: 'Distracted Boyfriend',
    imagePath: 'distracted-boyfriend.png',
    width: 1200,
    height: 800,
    description: 'Distracted boyfriend looking at another woman',
    tags: ['boyfriend', 'distracted', 'cheating'],
    textBoxes: {
      top: {
        x: 200,
        y: 50,
        width: 300,
        height: 150,
        fontSize: 40,
        fontFamily: 'Impact',
        textColor: '#FFFFFF',
        strokeColor: '#000000',
        strokeWidth: 2,
        maxWidth: 280
      },
      bottom: {
        x: 800,
        y: 50,
        width: 300,
        height: 150,
        fontSize: 40,
        fontFamily: 'Impact',
        textColor: '#FFFFFF',
        strokeColor: '#000000',
        strokeWidth: 2,
        maxWidth: 280
      }
    }
  },
  doge: {
    name: 'Doge',
    imagePath: 'doge.png',
    width: 800,
    height: 600,
    description: 'Much wow, very doge',
    tags: ['doge', 'shibe', 'wow'],
    textBoxes: {
      top: {
        x: 400,
        y: 50,
        width: 350,
        height: 200,
        fontSize: 35,
        fontFamily: 'Comic Sans MS',
        textColor: '#FFFFFF',
        strokeColor: '#000000',
        strokeWidth: 2,
        maxWidth: 330
      },
      bottom: {
        x: 400,
        y: 350,
        width: 350,
        height: 200,
        fontSize: 35,
        fontFamily: 'Comic Sans MS',
        textColor: '#FFFFFF',
        strokeColor: '#000000',
        strokeWidth: 2,
        maxWidth: 330
      }
    }
  },
  'two-buttons': {
    name: 'Two Buttons',
    imagePath: 'two-buttons.png',
    width: 1000,
    height: 600,
    description: 'Two buttons meme',
    tags: ['buttons', 'choice', 'decision'],
    textBoxes: {
      top: {
        x: 500,
        y: 100,
        width: 400,
        height: 150,
        fontSize: 45,
        fontFamily: 'Impact',
        textColor: '#FFFFFF',
        strokeColor: '#000000',
        strokeWidth: 2,
        maxWidth: 380
      },
      bottom: {
        x: 500,
        y: 350,
        width: 400,
        height: 150,
        fontSize: 45,
        fontFamily: 'Impact',
        textColor: '#FFFFFF',
        strokeColor: '#000000',
        strokeWidth: 2,
        maxWidth: 380
      }
    }
  },
  'change-my-mind': {
    name: 'Change My Mind',
    imagePath: 'change-my-mind.png',
    width: 1000,
    height: 600,
    description: 'Steven Crowder change my mind meme',
    tags: ['crowder', 'change', 'mind', 'debate'],
    textBoxes: {
      top: {
        x: 500,
        y: 50,
        width: 450,
        height: 200,
        fontSize: 50,
        fontFamily: 'Impact',
        textColor: '#FFFFFF',
        strokeColor: '#000000',
        strokeWidth: 3,
        maxWidth: 430
      }
    }
  },
  'one-does-not-simply': {
    name: 'One Does Not Simply',
    imagePath: 'one-does-not-simply.png',
    width: 800,
    height: 600,
    description: 'Boromir one does not simply meme',
    tags: ['boromir', 'lotr', 'simply'],
    textBoxes: {
      top: {
        x: 400,
        y: 50,
        width: 350,
        height: 150,
        fontSize: 40,
        fontFamily: 'Impact',
        textColor: '#FFFFFF',
        strokeColor: '#000000',
        strokeWidth: 2,
        maxWidth: 330
      },
      bottom: {
        x: 400,
        y: 400,
        width: 350,
        height: 150,
        fontSize: 40,
        fontFamily: 'Impact',
        textColor: '#FFFFFF',
        strokeColor: '#000000',
        strokeWidth: 2,
        maxWidth: 330
      }
    }
  }
};

/**
 * Backwards-compatible alias. `MEME_TEMPLATES` historically only contained
 * built-ins; consumers should now use {@link getAllTemplates} which also
 * includes custom templates.
 */
export const MEME_TEMPLATES = BUILTIN_MEME_TEMPLATES;

const DEFAULT_TEMPLATES_DIR = path.join(__dirname, '..', '..', 'templates');

let customTemplatesDir = DEFAULT_TEMPLATES_DIR;
let customTemplatesCache: Record<string, MemeTemplate> | null = null;
let customTemplatesMtime = 0;

/**
 * Override the directory used to look up custom templates
 * (`<dir>/custom-templates.json`). Useful for tests and embedders.
 */
export function setTemplatesDirectory(dir: string): void {
  customTemplatesDir = dir;
  customTemplatesCache = null;
  customTemplatesMtime = 0;
}

export function getTemplatesDirectory(): string {
  return customTemplatesDir;
}

/**
 * Force the next template lookup to re-read `custom-templates.json` from disk.
 */
export function invalidateCustomTemplatesCache(): void {
  customTemplatesCache = null;
  customTemplatesMtime = 0;
}

function loadCustomTemplates(): Record<string, MemeTemplate> {
  const file = path.join(customTemplatesDir, 'custom-templates.json');
  try {
    const stat = fs.statSync(file);
    if (customTemplatesCache && stat.mtimeMs === customTemplatesMtime) {
      return customTemplatesCache;
    }
    const raw = fs.readFileSync(file, 'utf8');
    customTemplatesCache = JSON.parse(raw) as Record<string, MemeTemplate>;
    customTemplatesMtime = stat.mtimeMs;
    return customTemplatesCache;
  } catch {
    customTemplatesCache = {};
    customTemplatesMtime = 0;
    return customTemplatesCache;
  }
}

/**
 * Returns built-in templates merged with any custom templates registered via
 * `DynamicTemplateLoader` / the API. Custom templates win on key collision.
 */
export function getAllTemplates(): Record<string, MemeTemplate> {
  return { ...BUILTIN_MEME_TEMPLATES, ...loadCustomTemplates() };
}

export function getTemplate(name: string): MemeTemplate | null {
  const all = getAllTemplates();
  return all[name.toLowerCase()] || all[name] || null;
}

export function listTemplates(): string[] {
  return Object.keys(getAllTemplates());
}

export function searchTemplates(query: string): string[] {
  const searchTerm = query.toLowerCase();
  return Object.entries(getAllTemplates())
    .filter(([key, template]) =>
      key.toLowerCase().includes(searchTerm) ||
      template.name.toLowerCase().includes(searchTerm) ||
      template.description?.toLowerCase().includes(searchTerm) ||
      template.tags?.some((tag) => tag.toLowerCase().includes(searchTerm))
    )
    .map(([key]) => key);
}
