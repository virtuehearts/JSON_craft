import { z } from 'zod';

const envSchema = z.object({
  VITE_OPENROUTER_API_KEY: z.string().optional(),
  VITE_OPENROUTER_BASE_URL: z.string().default('https://openrouter.ai/api'),
  VITE_MODEL: z.string().default('openai/gpt-4.1-mini')
});

type Env = z.infer<typeof envSchema>;

let envCache: Env | null = null;

export function getEnv(): Env {
  if (envCache) return envCache;
  const parsed = envSchema.safeParse(import.meta.env);
  if (!parsed.success) {
    // eslint-disable-next-line no-console
    console.warn('Environment validation failed', parsed.error.flatten().fieldErrors);
    envCache = envSchema.parse({});
  } else {
    envCache = parsed.data;
  }
  return envCache;
}
