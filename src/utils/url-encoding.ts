/**
 * Encode/decode a single meme text segment for use in URL paths, in the
 * style of memegen.link. The goal is: a meme URL like
 *   /images/drake/hello_world/its_working~q.png
 * renders "hello world" over "its working?".
 *
 * Encoding rules:
 *   - space → underscore
 *   - literal underscore → double underscore (__)
 *   - literal dash → double dash (--)
 *   - `?` → ~q
 *   - `&` → ~a
 *   - `%` → ~p
 *   - `#` → ~h
 *   - `/` → ~s
 *   - `<` → ~l
 *   - `>` → ~g
 *   - `"` → ~d
 *   - `'` → ~r
 *   - newline → ~n
 *   - `~` → ~~
 */

const ENCODE: Array<[RegExp, string]> = [
  [/~/g, '~~'],
  [/\n/g, '~n'],
  [/\?/g, '~q'],
  [/&/g, '~a'],
  [/%/g, '~p'],
  [/#/g, '~h'],
  [/\//g, '~s'],
  [/</g, '~l'],
  [/>/g, '~g'],
  [/"/g, '~d'],
  [/'/g, '~r'],
  // Literal underscore → double underscore; literal dash → double dash.
  // Single underscore/dash in the encoded path is reserved for spaces.
  [/_/g, '__'],
  [/-/g, '--'],
  [/ /g, '_']
];

export function encodeMemeSegment(text: string): string {
  let out = text;
  for (const [re, rep] of ENCODE) out = out.replace(re, rep);
  return out;
}

const DECODE_MAP: Record<string, string> = {
  n: '\n',
  q: '?',
  a: '&',
  p: '%',
  h: '#',
  s: '/',
  l: '<',
  g: '>',
  d: '"',
  r: "'",
  '~': '~'
};

export function decodeMemeSegment(segment: string): string {
  let out = '';
  for (let i = 0; i < segment.length; i++) {
    const ch = segment[i];
    const next = segment[i + 1];
    if (ch === '~' && next !== undefined) {
      const mapped = DECODE_MAP[next];
      if (mapped !== undefined) {
        out += mapped;
        i += 1;
        continue;
      }
      out += ch;
      continue;
    }
    if (ch === '_' && next === '_') {
      out += '_';
      i += 1;
      continue;
    }
    if (ch === '-' && next === '-') {
      out += '-';
      i += 1;
      continue;
    }
    if (ch === '_') {
      out += ' ';
      continue;
    }
    out += ch;
  }
  return out;
}

/**
 * Given the path tail after /images/:template/, extract line segments.
 * The final segment may carry a `.ext` suffix which callers should strip
 * before decoding.
 */
export function splitMemePath(pathTail: string): { segments: string[]; ext: string | null } {
  const trimmed = pathTail.replace(/^\/+/, '').replace(/\/+$/, '');
  if (!trimmed) return { segments: [], ext: null };
  const parts = trimmed.split('/');
  const last = parts[parts.length - 1];
  const dot = last.lastIndexOf('.');
  let ext: string | null = null;
  if (dot > 0 && dot < last.length - 1) {
    ext = last.slice(dot + 1).toLowerCase();
    parts[parts.length - 1] = last.slice(0, dot);
  }
  return { segments: parts, ext };
}
