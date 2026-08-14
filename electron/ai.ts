import { analyzeWithGemini, analyzeTextWithGemini } from './providers/gemini'
import { analyzeWithOpenAI, analyzeTextWithOpenAI } from './providers/openai'

export type AIProvider = 'gemini' | 'openai'

export interface AnalyzeScreenOptions {
  provider: AIProvider
  model: string
  imageBase64: string
}

export interface AnalyzeTextOptions {
  provider: AIProvider
  model: string
  text: string
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

export async function analyzeText({
  provider,
  model,
  text,
}: AnalyzeTextOptions) {
  switch (provider) {
    case 'gemini':
      return analyzeTextWithGemini(text, model)

    case 'openai':
      return analyzeTextWithOpenAI(text, model)

    default:
      throw new Error(`Unsupported AI provider: ${provider}`)
  }
}