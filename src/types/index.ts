export type MemeOutputFormat = 'png' | 'jpeg' | 'jpg' | 'webp' | 'avif';

export interface MemeOptions {
  template: string;
  topText?: string;
  bottomText?: string;
  /**
   * Alternative to topText/bottomText. When provided, lines are distributed
   * evenly across the template's available text boxes (top, bottom, and any
   * mid-* boxes). Takes precedence over top/bottom when non-empty.
   */
  lines?: string[];
  fontSize?: number;
  fontFamily?: string;
  /**
   * Text color. Accepts a single hex color or an array of hex colors that
   * cycle per line, so multi-line memes can have different colors per line.
   */
  textColor?: string | string[];
  /** Same semantics as `textColor` but for the outline. */
  strokeColor?: string | string[];
  strokeWidth?: number;
  maxWidth?: number;
  /** Output format. Defaults to `png`. */
  format?: MemeOutputFormat;
  /** Codec quality 1-100. Honored by jpeg/webp/avif. */
  quality?: number;
  /**
   * Optional URL or absolute file path pointing to a background image. When
   * set, this image replaces the template's own PNG — useful for one-off
   * memes without first uploading a template.
   */
  background?: string;
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
    /**
     * Optional extra text boxes stacked between top and bottom. Keys are
     * free-form (e.g. `mid1`, `mid2`) and are consumed in insertion order
     * when the user supplies a `lines` array longer than 2.
     */
    [key: string]: TextBox | undefined;
  };
  description?: string;
  tags?: string[];
  /**
   * Free-form search keywords (distinct from tags, which are more categorical).
   * Used by `searchTemplates` to score matches.
   */
  keywords?: string[];
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
