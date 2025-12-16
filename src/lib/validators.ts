import { z } from 'zod';

const structuredPromptSchema = z.object({
  style: z.string(),
  camera: z.string().optional(),
  subject: z.object({
    description: z.string(),
    expression: z.string().optional(),
    hair: z.string().optional(),
    outfit: z.string().optional()
  }),
  background: z.object({
    layer: z.string().optional(),
    palette: z.string().optional()
  }),
  lighting: z.string().optional(),
  mood: z.string().optional(),
  notes: z.string().optional()
});

export const promptSchema = z.union([structuredPromptSchema, z.string().min(1)]);

export const assistantResponseSchema = z.object({
  prompt: promptSchema,
  reasoning: z.union([z.array(z.string()), z.string()]).optional()
});

export type PromptOutput = z.infer<typeof promptSchema>;
export type AssistantResponse = z.infer<typeof assistantResponseSchema>;

export type ValidationResult =
  | { ok: true; data: AssistantResponse }
  | { ok: false; error: unknown; parsed?: unknown };

export function validateOutput(raw: string): ValidationResult {
  try {
    const parsed = JSON.parse(raw);
    const result = assistantResponseSchema.safeParse(parsed);
    if (result.success) {
      return { ok: true, data: result.data };
    }
    return { ok: false, error: result.error.flatten().fieldErrors, parsed };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}
