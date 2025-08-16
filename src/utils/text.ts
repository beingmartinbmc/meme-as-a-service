import { TextBox } from '../types';

export function wrapText(text: string, maxWidth: number, fontSize: number = 40): string[] {
  if (!text) return [];
  
  // Simple text wrapping based on character count
  // This is a simplified version - in a real implementation you'd want to measure actual text width
  const charsPerLine = Math.floor(maxWidth / (fontSize * 0.6)); // Rough estimate
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0] || '';

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    if ((currentLine + ' ' + word).length <= charsPerLine) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  
  lines.push(currentLine);
  return lines;
}

export function calculateFontSize(
  text: string,
  maxWidth: number,
  maxHeight: number,
  minFontSize: number = 12,
  maxFontSize: number = 120
): number {
  let fontSize = maxFontSize;
  
  while (fontSize > minFontSize) {
    const lines = wrapText(text, maxWidth, fontSize);
    const lineHeight = fontSize * 1.2;
    const totalHeight = lines.length * lineHeight;
    
    if (totalHeight <= maxHeight) {
      return fontSize;
    }
    
    fontSize -= 2;
  }
  
  return minFontSize;
}

// This function is no longer needed as we're using SVG for text rendering
// Keeping it for potential future use with canvas
export function drawText(
  text: string,
  textBox: TextBox,
  options: {
    fontSize?: number;
    fontFamily?: string;
    textColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
  } = {}
): string {
  if (!text) return '';

  const {
    fontSize = textBox.fontSize || 40,
    fontFamily = textBox.fontFamily || 'Impact',
    textColor = textBox.textColor || '#FFFFFF',
    strokeColor = textBox.strokeColor || '#000000',
    strokeWidth = textBox.strokeWidth || 2
  } = options;

  const maxWidth = textBox.maxWidth || textBox.width;
  const lines = wrapText(text, maxWidth, fontSize);
  const lineHeight = fontSize * 1.2;
  
  let svgText = '';
  lines.forEach((line, index) => {
    const y = textBox.y + (index * lineHeight);
    
    svgText += `
      <text x="${textBox.x + textBox.width / 2}" y="${y}" 
            font-family="${fontFamily}, Arial, sans-serif" 
            font-size="${fontSize}" 
            text-anchor="middle" 
            fill="${textColor}"
            stroke="${strokeColor}" 
            stroke-width="${strokeWidth}">
        ${line}
      </text>
    `;
  });
  
  return svgText;
}

export function sanitizeText(text: string): string {
  if (!text) return '';
  
  // Remove or replace problematic characters
  return text
    .replace(/[^\w\s\-_.,!?()]/g, '') // Remove special characters except common ones
    .trim();
}

export function truncateText(text: string, maxLength: number = 100): string {
  if (!text) return '';
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength - 3) + '...';
}
