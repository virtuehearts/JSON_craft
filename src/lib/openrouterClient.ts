import { z } from 'zod';
import { getEnv } from '../config/env';
import { PromptTemplate } from '../types/prompt';

const jsonChoiceSchema = z.object({
  message: z.object({
    role: z.string(),
    content: z.string()
  }),
  finish_reason: z.string().nullable().optional(),
  usage: z
    .object({
      prompt_tokens: z.number().optional(),
      completion_tokens: z.number().optional(),
      total_tokens: z.number().optional()
    })
    .optional()
});

const completionSchema = z.object({
  id: z.string(),
  choices: z.array(jsonChoiceSchema),
  created: z.number(),
  model: z.string()
});

export type JsonChoice = z.infer<typeof jsonChoiceSchema>;
export type CompletionResponse = z.infer<typeof completionSchema>;

export interface ChatPayload {
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
  template?: PromptTemplate;
  stream?: boolean;
}

export interface ApiErrorPayload {
  status: number;
  message: string;
  retryAfter?: number;
}

function buildHeaders() {
  const env = getEnv();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (env.VITE_OPENROUTER_API_KEY) {
    headers['Authorization'] = `Bearer ${env.VITE_OPENROUTER_API_KEY}`;
  }
  return headers;
}

export async function sendJsonChat(payload: ChatPayload): Promise<CompletionResponse> {
  const env = getEnv();
  const requestBody = {
    model: env.VITE_MODEL,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'You are JSONCraft, an assistant that ONLY outputs valid JSON following the provided schema and never plain text. If unsure, return an empty JSON object with an `error` field.'
      },
      ...payload.messages
    ],
    stream: payload.stream ?? false,
    max_output_tokens: 500
  };

  const response = await fetch(`${env.VITE_OPENROUTER_BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const retryAfter = Number(response.headers.get('Retry-After') || undefined);
    const text = await response.text();
    throw <ApiErrorPayload>{ status: response.status, message: text, retryAfter };
  }

  const json = await response.json();
  const parsed = completionSchema.safeParse(json);
  if (!parsed.success) {
    const error = parsed.error.flatten().fieldErrors;
    throw <ApiErrorPayload>{ status: 422, message: `Schema validation failed: ${JSON.stringify(error)}` };
  }

  const first = parsed.data.choices[0];
  const messageText = first.message.content.trim();
  if (!messageText.startsWith('{')) {
    throw <ApiErrorPayload>{ status: 422, message: 'Assistant did not return JSON content' };
  }

  return parsed.data;
}
