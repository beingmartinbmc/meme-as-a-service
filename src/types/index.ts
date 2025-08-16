export interface MemeOptions {
  template: string;
  topText?: string;
  bottomText?: string;
  fontSize?: number;
  fontFamily?: string;
  textColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  maxWidth?: number;
  quality?: number;
}

export interface MemeConfig {
  outputDirectory?: string;
  defaultFontSize?: number;
  defaultFontFamily?: string;
  defaultTextColor?: string;
  defaultStrokeColor?: string;
  defaultStrokeWidth?: number;
  templatesPath?: string;
}

export interface TextBox {
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  fontFamily?: string;
  textColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  maxWidth?: number;
}

export interface MemeTemplate {
  name: string;
  imagePath: string;
  width: number;
  height: number;
  textBoxes: {
    top?: TextBox;
    bottom?: TextBox;
  };
  description?: string;
  tags?: string[];
}

export interface MemeResult {
  buffer: Buffer;
  format: string;
  width: number;
  height: number;
  template: string;
  options: MemeOptions;
}

export interface BatchMemeOptions {
  templates: string[];
  texts: Array<{
    topText?: string;
    bottomText?: string;
  }>;
  options?: Partial<MemeOptions>;
}

export interface BatchMemeResult {
  results: MemeResult[];
  total: number;
  successful: number;
  failed: number;
  errors: Array<{
    template: string;
    error: string;
  }>;
}
