// Test setup file
import { TextEncoder, TextDecoder } from 'util';

// Polyfill for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as unknown as typeof global.TextDecoder;

process.env.NODE_ENV = 'test';

// Mock sharp globally so tests don't need libvips or real template PNGs.
// Individual tests can override with jest.unmock() or jest.resetModules().
jest.mock('sharp', () => {
  const fakeBuffer = () => Promise.resolve(Buffer.from('fake-image-data'));
  const encoder = () => ({ toBuffer: jest.fn(fakeBuffer) });
  const builder: Record<string, jest.Mock> = {
    metadata: jest.fn(() => Promise.resolve({ width: 800, height: 600 })) as jest.Mock,
    composite: jest.fn(() => builder) as jest.Mock,
    png: jest.fn(() => encoder()) as jest.Mock,
    jpeg: jest.fn(() => encoder()) as jest.Mock,
    webp: jest.fn(() => encoder()) as jest.Mock,
    avif: jest.fn(() => encoder()) as jest.Mock,
    toBuffer: jest.fn(fakeBuffer) as jest.Mock
  };
  const mockSharp: jest.Mock = jest.fn(() => builder);
  return mockSharp;
});
