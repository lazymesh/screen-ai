# Screen AI

Screen AI is a desktop AI assistant built with Electron, React, Vite, and TypeScript.

It allows you to place a transparent, resizable window over any content on your screen and ask an AI model to understand and answer questions about that content.

The application is designed around a simple workflow:

1. Resize the Screen AI window over the content you want the AI to see.
2. Press the configured global hotkey.
3. Screen AI captures the content behind the window.
4. The selected AI provider analyzes the screenshot.
5. The answer appears directly inside the Screen AI window.

## Features

- Transparent and resizable desktop window
- Global keyboard shortcut for asking the AI
- Screen capture based on the current window area
- No need to repeatedly select a screen region
- Gemini and OpenAI provider support
- Model selection from the application UI
- AI answers displayed directly in the overlay
- Markdown rendering
- GitHub-Flavored Markdown support
- Code blocks
- Tables
- Lists and headings
- Scrollable long answers
- Electron-based standalone desktop application
- macOS and Windows packaging support

## How It Works

Screen AI does not need to remember which application is underneath it.

The user controls the area that should be analyzed by resizing and positioning the transparent Screen AI window.

The basic flow is:

```text
┌──────────────────────────────┐
│       Screen AI Window       │
│                              │
│  Transparent / Resizable     │
│                              │
│  ┌────────────────────────┐  │
│  │   Content underneath   │  │
│  │   is visible through    │  │
│  │   the Screen AI window  │  │
│  └────────────────────────┘  │
└──────────────────────────────┘
               │
          Global Hotkey
               │
               ▼
        Capture Screen Area
               │
               ▼
          Selected AI Model
               │
               ▼
             Answer