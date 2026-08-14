import { GoogleGenAI } from '@google/genai'

export async function analyzeWithGemini(
  imageBase64: string,
  model: string,
) {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured. Add it to your .env file.',
    )
  }

  const ai = new GoogleGenAI({
    apiKey,
  })

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `
You are Screen AI.

Analyze the content visible in this screenshot and help the user
understand or answer it.

If there is a question, answer it directly.
If there is code, identify errors and explain how to fix them.
If there is a mathematical problem, solve it and explain the steps.
If there is a document or passage, summarize or explain the relevant
content.
If there is a table, diagram, or other visual information, interpret it.

Focus on useful information rather than describing the screenshot.
            `.trim(),
          },
          {
            inlineData: {
              mimeType: 'image/png',
              data: imageBase64,
            },
          },
        ],
      },
    ],
  })

  return response.text ?? 'No answer was returned.'
}

export async function analyzeTextWithGemini(
  text: string,
  model: string,
) {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured. Add it to your .env file.',
    )
  }

  const ai = new GoogleGenAI({
    apiKey,
  })

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        role: 'user',
        parts: [
          {
            text,
          },
        ],
      },
    ],
  })

  return response.text ?? 'No answer was returned.'
}