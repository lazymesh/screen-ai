export {}

declare global {
  interface Window {
    screenAI: {
      onHotkey: (callback: () => void) => () => void

      capture: () => Promise<string>

      analyze: (options: {
        provider: 'gemini' | 'openai'
        model: string
        imageBase64: string
      }) => Promise<string>
    }
  }
}