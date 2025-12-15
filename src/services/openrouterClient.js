import { OpenRouter } from '@openrouter/sdk';

const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || 'demo-key-missing'
});

const DEMO_PROMPT = {
  style: 'cinematic still',
  camera: 'medium shot',
  subject: {
    description: 'placeholder subject',
    expression: 'neutral',
    hair: 'short wavy dark hair',
    outfit: 'casual streetwear'
  },
  background: {
    layer: 'urban alley with neon signage'
  },
  lighting: 'soft rim lighting',
  mood: 'moody and modern'
};

export async function buildPromptFromImage(file) {
  if (!process.env.OPENROUTER_API_KEY) {
    return {
      prompt: DEMO_PROMPT,
      reasoning: ['OPENROUTER_API_KEY missing; returning demo JSON prompt.']
    };
  }

  const encodedImage = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

  const response = await openrouter.chat.completions.create({
    model: 'nvidia/nemotron-nano-12b-v2-vl:free',
    reasoning: { effort: 'medium' },
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'make a complete detailed JSON output of this image to be able to recreate it in an image generator. paying heed to style, camera angle, pose, hair, outfit, background layer, expression. face details ect.' },
          { type: 'image_url', image_url: encodedImage }
        ]
      }
    ]
  });

  const choice = response.choices?.[0];
  const messageContent = choice?.message?.content || '';
  const reasoningDetails = choice?.message?.reasoning_details || [];

  return {
    prompt: safeParseJson(messageContent),
    reasoning: reasoningDetails
  };
}

function safeParseJson(payload) {
  try {
    return JSON.parse(payload);
  } catch (error) {
    return { raw: payload, error: 'Response was not valid JSON', details: error.message };
  }
}
