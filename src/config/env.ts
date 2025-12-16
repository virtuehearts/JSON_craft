import { z } from 'zod';

const envSchema = z.object({
  VITE_OPENROUTER_API_KEY: z.string().optional(),
  VITE_OPENROUTER_BASE_URL: z.string().default('https://openrouter.ai/api'),
  VITE_MODEL: z
    .string()
    .default('nvidia/nemotron-nano-12b-v2-vl:free')
});

type Env = z.infer<typeof envSchema>;

let envCache: Env | null = null;

function readRuntimeApiKey() {
  if (typeof window === 'undefined') return undefined;
  return localStorage.getItem('openrouter_api_key') || undefined;
}

export function getEnv(): Env {
  if (envCache) return envCache;
  const parsed = envSchema.safeParse({
    ...import.meta.env,
    VITE_OPENROUTER_API_KEY: readRuntimeApiKey() || import.meta.env.VITE_OPENROUTER_API_KEY
  });
  if (!parsed.success) {
    // eslint-disable-next-line no-console
    console.warn('Environment validation failed', parsed.error.flatten().fieldErrors);
    envCache = envSchema.parse({});
  } else {
    envCache = parsed.data;
  }
  return envCache;
}

export function setRuntimeApiKey(key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('openrouter_api_key', key);
  }
  envCache = null;
}

export function clearRuntimeApiKey() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('openrouter_api_key');
  }
  envCache = null;
}
