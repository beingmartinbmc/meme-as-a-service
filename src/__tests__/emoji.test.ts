import { replaceEmojiShortcodes, listEmojiShortcodes } from '../utils/emoji';
import { sanitizeText } from '../utils/text';

describe('emoji shortcodes', () => {
  it('replaces known shortcodes', () => {
    expect(replaceEmojiShortcodes('great job :thumbsup:')).toBe('great job 👍');
    expect(replaceEmojiShortcodes(':fire:')).toBe('🔥');
    expect(replaceEmojiShortcodes(':rocket: to the moon')).toBe('🚀 to the moon');
  });

  it('is case-insensitive', () => {
    expect(replaceEmojiShortcodes(':FIRE:')).toBe('🔥');
  });

  it('leaves unknown shortcodes untouched', () => {
    expect(replaceEmojiShortcodes('stats :winrate: go up')).toBe('stats :winrate: go up');
  });

  it('handles empty / missing input', () => {
    expect(replaceEmojiShortcodes('')).toBe('');
    expect(replaceEmojiShortcodes(undefined as unknown as string)).toBe(undefined);
  });

  it('covers most popular aliases', () => {
    const list = listEmojiShortcodes();
    for (const alias of [':thumbsup:', ':fire:', ':100:', ':heart:', ':rocket:']) {
      expect(list).toContain(alias);
    }
  });

  it('sanitizeText composes shortcode replacement with control-char stripping', () => {
    expect(sanitizeText(':fire: ok')).toBe('🔥 ok');
  });
});
