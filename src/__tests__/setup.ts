// Test setup file
import { TextEncoder, TextDecoder } from 'util';

// Polyfill for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mock sharp for testing
jest.mock('sharp', () => {
  const mockSharp = jest.fn(() => ({
    metadata: jest.fn(() => Promise.resolve({ width: 800, height: 600 })),
    composite: jest.fn(() => ({
      png: jest.fn(() => ({
        toBuffer: jest.fn(() => Promise.resolve(Buffer.from('fake-image-data')))
      }))
    })),
    png: jest.fn(() => ({
      toBuffer: jest.fn(() => Promise.resolve(Buffer.from('fake-image-data')))
    }))
  }));
  
  return mockSharp;
});
