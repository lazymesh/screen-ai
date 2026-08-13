import { analyzeWithGemini } from './providers/gemini'
import { analyzeWithOpenAI } from './providers/openai'

export type AIProvider = 'gemini' | 'openai'

export interface AnalyzeScreenOptions {
  provider: AIProvider
  model: string
  imageBase64: string
}

export async function analyzeScreen({
  provider,
  model,
  imageBase64,
}: AnalyzeScreenOptions) {
  switch (provider) {
    case 'gemini':
      return analyzeWithGemini(imageBase64, model)

    case 'openai':
      return analyzeWithOpenAI(imageBase64, model)

    default:
      throw new Error(`Unsupported AI provider: ${provider}`)
  }
}