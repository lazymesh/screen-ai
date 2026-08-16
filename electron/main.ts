import 'dotenv/config'
import {
  app,
  BrowserWindow,
  globalShortcut,
  desktopCapturer,
  screen,
  ipcMain,
} from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { analyzeScreen, analyzeText } from './ai'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    width: 900,
    height: 600,

    transparent: true,
    frame: false,
    resizable: true,
    alwaysOnTop: true,
    hasShadow: false,

    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

ipcMain.handle(
  'analyze-screen',
  async (
    _,
    options: {
      provider: 'gemini' | 'openai' | 'openrouter'
      model: string
      imageBase64: string
      apiKey: string
    },
  ) => {
    return analyzeScreen(options)
  },
)

ipcMain.handle(
  'analyze-text',
  async (
    _,
    options: {
      provider: 'gemini' | 'openai' | 'openrouter'
      model: string
      text: string
      apiKey: string
    },
  ) => {
    return analyzeText(options)
  },
)

ipcMain.handle('capture-screen-ai', async () => {
  if (!win) {
    throw new Error('Screen AI window does not exist')
  }

  const bounds = win.getBounds()

  // Find the display containing the center of our Screen AI window.
  const centerX = bounds.x + bounds.width / 2
  const centerY = bounds.y + bounds.height / 2

  const display = screen.getDisplayNearestPoint({
    x: Math.round(centerX),
    y: Math.round(centerY),
  })

  const scaleFactor = display.scaleFactor

  // Capture the entire display.
  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: {
      width: Math.round(display.bounds.width * scaleFactor),
      height: Math.round(display.bounds.height * scaleFactor),
    },
  })

  const source = sources.find(
    (item) => item.display_id === String(display.id)
  )

  if (!source) {
    throw new Error('Could not find the current display')
  }

  const image = source.thumbnail

  // Convert window coordinates from screen coordinates
  // to coordinates relative to the selected display.
  const cropX = Math.round(
    (bounds.x - display.bounds.x) * scaleFactor
  )

  const cropY = Math.round(
    (bounds.y - display.bounds.y) * scaleFactor
  )

  const cropWidth = Math.round(bounds.width * scaleFactor)
  const cropHeight = Math.round(bounds.height * scaleFactor)

  const cropped = image.crop({
    x: cropX,
    y: cropY,
    width: cropWidth,
    height: cropHeight,
  })

  return cropped.toPNG().toString('base64')
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  createWindow()

  const shortcut =
    process.platform === 'darwin'
      ? 'Command+Shift+Space'
      : 'Control+Shift+Space'

  const registered = globalShortcut.register(shortcut, () => {
    win?.webContents.send('screen-ai-hotkey')
  })

  if (!registered) {
    console.error(`Failed to register global shortcut: ${shortcut}`)
  }
})
