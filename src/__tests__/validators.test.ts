import { describe, expect, test } from 'vitest';
import { validateOutput, promptSchema } from '../lib/validators';

describe('validators', () => {
  test('validates prompt schema', () => {
    const valid = promptSchema.safeParse({
      style: 'cinematic',
      subject: { description: 'subject' },
      background: {},
      lighting: 'soft'
    });
    expect(valid.success).toBe(true);
  });

  test('detects invalid json', () => {
    const invalid = validateOutput('not json');
    expect(invalid.ok).toBe(false);
  });
});
