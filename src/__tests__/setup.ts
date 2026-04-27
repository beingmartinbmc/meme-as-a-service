// Test setup file
import { TextEncoder, TextDecoder } from 'util';

// Polyfill for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

process.env.NODE_ENV = 'test';

// Mock sharp so tests don't need libvips or real template PNGs.
jest.mock('sharp', () => {
  const fakeBuffer = () => Promise.resolve(Buffer.from('fake-image-data'));
  const encoder = () => ({ toBuffer: jest.fn(fakeBuffer) });
  const builder: any = {
    metadata: jest.fn(() => Promise.resolve({ width: 800, height: 600 })),
    composite: jest.fn(() => builder),
    png: jest.fn(() => encoder()),
    jpeg: jest.fn(() => encoder()),
    webp: jest.fn(() => encoder()),
    avif: jest.fn(() => encoder()),
    toBuffer: jest.fn(fakeBuffer)
  };
  const mockSharp: any = jest.fn(() => builder);
  return mockSharp;
});

// Pretend template image files always exist — avoid requiring real PNGs.
jest.mock('fs-extra', () => {
  const actual = jest.requireActual('fs-extra');
  return {
    ...actual,
    pathExists: jest.fn(async () => true),
    writeFile: jest.fn(async () => undefined),
    ensureDir: jest.fn(async () => undefined),
    copy: jest.fn(async () => undefined),
    remove: jest.fn(async () => undefined),
    readJson: jest.fn(async () => ({})),
    writeJson: jest.fn(async () => undefined)
  };
});
