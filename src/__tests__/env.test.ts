import { describe, expect, test } from 'vitest';
import { getEnv } from '../config/env';

describe('env config', () => {
  test('falls back to defaults', () => {
    const env = getEnv();
    expect(env.VITE_MODEL).toBeDefined();
    expect(env.VITE_OPENROUTER_BASE_URL).toContain('openrouter');
  });
});
