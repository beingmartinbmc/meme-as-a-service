import {
  encodeMemeSegment,
  decodeMemeSegment,
  splitMemePath
} from '../utils/url-encoding';

describe('url-encoding', () => {
  describe('encodeMemeSegment', () => {
    it('replaces spaces with underscores', () => {
      expect(encodeMemeSegment('hello world')).toBe('hello_world');
    });

    it('escapes literal underscores by doubling them', () => {
      expect(encodeMemeSegment('a_b')).toBe('a__b');
      expect(encodeMemeSegment('a__b')).toBe('a____b');
    });

    it('escapes literal dashes by doubling them', () => {
      expect(encodeMemeSegment('a-b')).toBe('a--b');
    });

    it('escapes tildes as ~~', () => {
      expect(encodeMemeSegment('a~b')).toBe('a~~b');
    });

    it('escapes query-string delimiters', () => {
      expect(encodeMemeSegment('why? not&yes')).toBe('why~q_not~ayes');
    });

    it('escapes newlines', () => {
      expect(encodeMemeSegment('top\nbot')).toBe('top~nbot');
    });

    it('escapes path separators', () => {
      expect(encodeMemeSegment('a/b')).toBe('a~sb');
    });

    it('escapes HTML-sensitive characters', () => {
      expect(encodeMemeSegment('<a>&"\'')).toBe('~la~g~a~d~r');
    });
  });

  describe('decodeMemeSegment', () => {
    it('restores spaces from underscores', () => {
      expect(decodeMemeSegment('hello_world')).toBe('hello world');
    });

    it('round-trips all encoded forms', () => {
      const samples = [
        'hello world',
        'with spaces and punctuation!',
        'line1\nline2',
        'why? because&why',
        'a/b/c',
        'literal_underscore',
        'tilde~inside',
        'quotes "yes" \'no\'',
        '<tag>html</tag>',
        'percent 50% off',
        'hashtag #hot'
      ];
      for (const s of samples) {
        expect(decodeMemeSegment(encodeMemeSegment(s))).toBe(s);
      }
    });

    it('leaves unknown ~X escapes alone', () => {
      expect(decodeMemeSegment('foo~xbar')).toBe('foo~xbar');
    });

    it('decodes trailing tilde as literal', () => {
      expect(decodeMemeSegment('foo~')).toBe('foo~');
    });

    it('handles empty segment', () => {
      expect(decodeMemeSegment('')).toBe('');
    });
  });

  describe('splitMemePath', () => {
    it('returns empty result for empty path', () => {
      expect(splitMemePath('')).toEqual({ segments: [], ext: null });
      expect(splitMemePath('/')).toEqual({ segments: [], ext: null });
    });

    it('splits a two-line path with extension', () => {
      const r = splitMemePath('line1/line2.png');
      expect(r.segments).toEqual(['line1', 'line2']);
      expect(r.ext).toBe('png');
    });

    it('handles single segment', () => {
      expect(splitMemePath('only.webp')).toEqual({ segments: ['only'], ext: 'webp' });
    });

    it('no extension when no dot', () => {
      expect(splitMemePath('a/b/c')).toEqual({ segments: ['a', 'b', 'c'], ext: null });
    });

    it('ignores dotfiles (leading dot)', () => {
      expect(splitMemePath('.hidden')).toEqual({ segments: ['.hidden'], ext: null });
    });

    it('strips only the last segment extension', () => {
      const r = splitMemePath('first.thing/second.png');
      expect(r.segments).toEqual(['first.thing', 'second']);
      expect(r.ext).toBe('png');
    });

    it('normalizes leading and trailing slashes', () => {
      expect(splitMemePath('/a/b.png/')).toEqual({ segments: ['a', 'b'], ext: 'png' });
    });
  });
});
