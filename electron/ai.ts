import { analyzeWithGemini, analyzeTextWithGemini } from './providers/gemini'
import { analyzeWithOpenAI, analyzeTextWithOpenAI } from './providers/openai'
import {
  analyzeWithOpenRouter,
  analyzeTextWithOpenRouter,
} from './providers/openrouter'

export type AIProvider = 'gemini' | 'openai' | 'openrouter'

export interface AnalyzeScreenOptions {
  provider: AIProvider
  model: string
  imageBase64: string
  apiKey: string
}

export interface AnalyzeTextOptions {
  provider: AIProvider
  model: string
  text: string
  apiKey: string
}

export async function analyzeScreen({
  provider,
  model,
  imageBase64,
  apiKey,
}: AnalyzeScreenOptions) {
  switch (provider) {
    case 'gemini':
      return analyzeWithGemini(imageBase64, model, apiKey)

    case 'openai':
      return analyzeWithOpenAI(imageBase64, model, apiKey)

    case 'openrouter':
      return analyzeWithOpenRouter(imageBase64, model, apiKey)

    default:
      throw new Error(`Unsupported AI provider: ${provider}`)
  }
}

export async function analyzeText({
  provider,
  model,
  text,
  apiKey,
}: AnalyzeTextOptions) {
  switch (provider) {
    case 'gemini':
      return analyzeTextWithGemini(text, model, apiKey)

    case 'openai':
      return analyzeTextWithOpenAI(text, model, apiKey)

    case 'openrouter':
      return analyzeTextWithOpenRouter(text, model, apiKey)

    default:
      throw new Error(`Unsupported AI provider: ${provider}`)
  }
}