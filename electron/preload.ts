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
    provider: 'gemini' | 'openai'
    model: string
    imageBase64?: string
    text?: string
  }) {
    if (options.imageBase64) {
      return ipcRenderer.invoke('analyze-screen', options)
    } else if (options.text) {
      return ipcRenderer.invoke('analyze-text', options)
    } else {
      throw new Error('Either imageBase64 or text must be provided')
    }
  },
})
