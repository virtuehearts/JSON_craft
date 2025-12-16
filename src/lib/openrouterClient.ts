import { z } from 'zod';
import { getEnv } from '../config/env';
import { PromptTemplate } from '../types/prompt';
import { FALLBACK_IMAGE_PROMPT } from '../config/prompts';

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

export type PayloadMessage = { role: 'system' | 'user' | 'assistant'; content: string; imageData?: string };

export interface ChatPayload {
  messages: PayloadMessage[];
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
  const messages = [
    {
      role: 'system',
      content:
        [
          'You are Image Buddy, a JSON-only assistant that helps people craft image prompts.',
          'Always reply with valid JSON that matches the assistantResponseSchema (fields: prompt, optional reasoning). Never reply with plain text.',
          'Be collaborative and friendly—offer themes, genres, camera angles, filter effects, poses, and other visual ideas.',
          'Start by asking for (or using) an example/reference and where the image will be uploaded so you can tailor the style.',
          'After proposing a prompt, ask the user what they want adjusted before finalizing it.',
          'If the user only sends a photo with no text, generate the JSON description from the image and include a follow-up question asking if it should be saved to the gallery.',
          'If unsure about any field, return an empty JSON object with an `error` field to stay within schema.'
        ].join(' ')
    },
    ...(payload.template
      ? [
          {
            role: 'system',
            content: `Apply this JSON style: ${payload.template.json}`
          }
        ]
      : []),
    ...payload.messages.map((message) => {
      if (message.imageData) {
        return {
          role: message.role,
          content: [
            { type: 'text', text: message.content || FALLBACK_IMAGE_PROMPT },
            { type: 'image_url', image_url: { url: message.imageData } }
          ]
        };
      }

      return { role: message.role, content: message.content };
    })
  ];

  const requestBody = {
    model: env.VITE_MODEL,
    response_format: { type: 'json_object' },
    messages,
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
