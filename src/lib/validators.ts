import { z } from 'zod';

export const promptSchema = z.object({
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

export const assistantResponseSchema = z.object({
  prompt: promptSchema,
  reasoning: z.array(z.string()).optional()
});

export type PromptOutput = z.infer<typeof promptSchema>;

export function validateOutput(raw: string) {
  try {
    const parsed = JSON.parse(raw);
    const result = assistantResponseSchema.safeParse(parsed);
    if (result.success) {
      return { ok: true as const, data: result.data };
    }
    return { ok: false as const, error: result.error.flatten().fieldErrors };
  } catch (error) {
    return { ok: false as const, error: (error as Error).message };
  }
}
