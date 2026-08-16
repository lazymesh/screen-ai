import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },
  onScreenAIHotkey(callback: () => void) {
    const listener = () => callback()

    ipcRenderer.on('screen-ai-hotkey', listener)

    return () => {
      ipcRenderer.removeListener('screen-ai-hotkey', listener)
    }
  },
  captureScreenAI() {
    return ipcRenderer.invoke('capture-screen-ai')
  },
  analyzeScreen(options: {
    provider: 'gemini' | 'openai'
    model: string
    imageBase64: string
  }) {
    return ipcRenderer.invoke('analyze-screen', options)
  },
})
const normalizeForIPC = (value: string) =>
  value
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2026]/g, '...')
    .replace(/[\u00A0]/g, ' ')

contextBridge.exposeInMainWorld('screenAI', {
  onHotkey(callback: () => void) {
    const listener = () => callback()

    ipcRenderer.on('screen-ai-hotkey', listener)

    return () => {
      ipcRenderer.removeListener('screen-ai-hotkey', listener)
    }
  },

  capture() {
    return ipcRenderer.invoke('capture-screen-ai')
  },

  analyze(options: {
    provider: 'gemini' | 'openai' | 'openrouter'
    model: string
    imageBase64?: string
    text?: string
    apiKey?: string
  }) {
    const safeOptions = {
      ...options,
      apiKey: options.apiKey ? normalizeForIPC(options.apiKey.trim()) : undefined,
      text: options.text ? normalizeForIPC(options.text) : undefined,
    }

    if (!safeOptions.apiKey?.trim()) {
      throw new Error('API key is required.')
    }

    if (safeOptions.imageBase64) {
      return ipcRenderer.invoke('analyze-screen', safeOptions)
    } else if (safeOptions.text) {
      return ipcRenderer.invoke('analyze-text', safeOptions)
    } else {
      throw new Error('Either imageBase64 or text must be provided')
    }
  },
})
