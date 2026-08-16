export async function analyzeWithOpenRouter(
  imageBase64: string,
  model: string,
  apiKey: string,
) {
  if (!apiKey?.trim()) {
    throw new Error('OpenRouter API key is required.')
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://localhost',
      'X-Title': 'Screen AI',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
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
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`OpenRouter request failed: ${response.status} ${text}`)
  }

  const data = await response.json()

  return (
    data?.choices?.[0]?.message?.content ??
    'No answer was returned.'
  )
}

export async function analyzeTextWithOpenRouter(
  text: string,
  model: string,
  apiKey: string,
) {
  if (!apiKey?.trim()) {
    throw new Error('OpenRouter API key is required.')
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://localhost',
      'X-Title': 'Screen AI',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'user',
          content: text,
        },
      ],
    }),
  })

  if (!response.ok) {
    const textResponse = await response.text()
    throw new Error(`OpenRouter request failed: ${response.status} ${textResponse}`)
  }

  const data = await response.json()

  return (
    data?.choices?.[0]?.message?.content ??
    'No answer was returned.'
  )
}
