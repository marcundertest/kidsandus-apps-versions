import { vi } from 'vitest';

// Mock server-only to prevent it from exploding in JSDOM
vi.mock('server-only', () => {
  return {};
});
