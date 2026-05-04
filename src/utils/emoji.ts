const SHORTCODES: Record<string, string> = {
  ':thumbsup:': '👍',
  ':+1:': '👍',
  ':thumbsdown:': '👎',
  ':-1:': '👎',
  ':fire:': '🔥',
  ':100:': '💯',
  ':laugh:': '😂',
  ':joy:': '😂',
  ':cry:': '😭',
  ':sob:': '😭',
  ':heart:': '❤️',
  ':thinking:': '🤔',
  ':eyes:': '👀',
  ':rocket:': '🚀',
  ':poop:': '💩',
  ':sparkles:': '✨',
  ':shrug:': '🤷',
  ':clap:': '👏',
  ':party:': '🎉',
  ':ok:': '👌',
  ':wave:': '👋',
  ':wink:': '😉',
  ':smile:': '😄',
  ':sad:': '😢',
  ':skull:': '💀',
  ':cool:': '😎'
};

const SHORTCODE_RE = /:([a-z0-9+_-]+):/gi;

/**
 * Replace `:name:` shortcodes with their emoji. Unknown shortcodes are kept
 * verbatim so user text containing `:foo:` (e.g. ratios) is not corrupted.
 */
export function replaceEmojiShortcodes(text: string): string {
  if (!text) return text;
  return text.replace(SHORTCODE_RE, (match) => {
    const key = match.toLowerCase();
    return SHORTCODES[key] || match;
  });
}

export function listEmojiShortcodes(): string[] {
  return Object.keys(SHORTCODES);
}
