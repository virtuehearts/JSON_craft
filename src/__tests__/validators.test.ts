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

  test('accepts simple string prompts', () => {
    const valid = promptSchema.safeParse('Just a prompt string');
    expect(valid.success).toBe(true);
  });

  test('detects invalid json', () => {
    const invalid = validateOutput('not json');
    expect(invalid.ok).toBe(false);
  });

  test('captures parsed content on schema failure', () => {
    const invalidSchema = validateOutput('{"unexpected":true}');
    expect(invalidSchema.ok).toBe(false);
    expect(invalidSchema.parsed).toBeTruthy();
  });

  test('validates assistant responses with string prompt bodies', () => {
    const response = validateOutput(
      JSON.stringify({ prompt: 'A prompt string', reasoning: 'single reasoning note' })
    );
    expect(response.ok).toBe(true);
  });
});
