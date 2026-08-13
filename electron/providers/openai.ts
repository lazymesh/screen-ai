import OpenAI from 'openai'

export async function analyzeWithOpenAI(
  imageBase64: string,
  model: string,
) {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY is not configured. Add it to your .env file.',
    )
  }

  const client = new OpenAI({
    apiKey,
  })

  const response = await client.responses.create({
    model,
    input: [
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: `
You are Screen AI.

Analyze the content visible in this screenshot and help the user
understand or answer it.

If there is a question, answer it directly.
If there is code, identify errors and explain how to fix them.
If there is a mathematical problem, solve it and explain the steps.
If there is a document or passage, summarize or explain the relevant
content.

Focus on useful information rather than describing the screenshot.
            `.trim(),
          },
          {
            type: 'input_image',
            image_url: `data:image/png;base64,${imageBase64}`,
            detail: 'auto',
          },
        ],
      },
    ],
  })

  return response.output_text
}