import {
  useEffect,
  useRef,
  useState,
} from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './App.css'

type AIProvider = 'gemini' | 'openai'

const AI_MODELS: Record<
  AIProvider,
  { id: string; name: string }[]
> = {
  gemini: [
    {
      id: 'gemini-3-flash-preview',
      name: 'Gemini 3 Flash Preview',
    },
    {
      id: 'gemini-3.5-flash',
      name: 'Gemini 3.5 Flash',
    },
    {
      id: 'gemini-3.1-flash-lite',
      name: 'Gemini 3.1 Flash',
    },
    {
      id: 'gemini-3.1-flash-lite',
      name: 'Gemini 3.1 Flash-Lite',
    },
  ],

  openai: [
    {
      id: 'gpt-5.4-mini',
      name: 'GPT-5.4 mini',
    },
  ],
}

function App() {
  const [provider, setProvider] =
    useState<AIProvider>('gemini')

  const [model, setModel] = useState(
    AI_MODELS.gemini[0].id,
  )

  const [capturing, setCapturing] = useState(false)
  const [thinking, setThinking] = useState(false)
  const [answer, setAnswer] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [textInput, setTextInput] = useState('')
  const [apiKey, setApiKey] = useState('')

  const providerRef = useRef(provider)
  const modelRef = useRef(model)
  const apiKeyRef = useRef(apiKey)
  const centerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    providerRef.current = provider
    modelRef.current = model
  }, [provider, model])

  useEffect(() => {
    apiKeyRef.current = apiKey
  }, [apiKey])

  const handleProviderChange = (
    newProvider: AIProvider,
  ) => {
    setProvider(newProvider)

    setModel(AI_MODELS[newProvider][0].id)
  }

  const normalizeForIPC = (value: string) =>
    value
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2013\u2014]/g, '-')
      .replace(/[\u2026]/g, '...')
      .replace(/[\u00A0]/g, ' ')

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return

    const trimmedApiKey = normalizeForIPC(apiKey.trim())

    if (!trimmedApiKey) {
      setError('Please enter your API key.')
      return
    }

    try {
      setError(null)
      setAnswer(null)
      setThinking(true)

      const result =
        await window.screenAI.analyze({
          provider: providerRef.current,
          model: modelRef.current,
          text: normalizeForIPC(textInput),
          apiKey: trimmedApiKey,
        })

      setAnswer(result)
    } catch (err) {
      console.error('Analysis failed:', err)

      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong.',
      )
    } finally {
      setThinking(false)
      setTextInput('')
    }
  }

  const handleTextKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleTextSubmit()
    }
  }

  const handleCenterKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
  ) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault()

      if (centerRef.current) {
        const scrollAmount = 40
        const scrollElement =
          centerRef.current.querySelector('.answer') ||
          centerRef.current

        if (event.key === 'ArrowUp') {
          scrollElement.scrollTop -= scrollAmount
        } else {
          scrollElement.scrollTop += scrollAmount
        }
      }
    }
  }

  useEffect(() => {
    const removeListener = window.screenAI.onHotkey(
      async () => {
        try {
          setError(null)
          setAnswer(null)

          // Hide only during screenshot capture
          setCapturing(true)

          await new Promise((resolve) =>
            setTimeout(resolve, 100),
          )

          const imageBase64 =
            await window.screenAI.capture()

          // Screenshot is complete.
          // Restore Screen AI immediately.
          setCapturing(false)

          // AI processing starts
          setThinking(true)

          const trimmedApiKey =
            normalizeForIPC(apiKeyRef.current.trim())

          if (!trimmedApiKey) {
            throw new Error('Please enter your API key.')
          }

          const result =
            await window.screenAI.analyze({
              provider: providerRef.current,
              model: modelRef.current,
              imageBase64,
              apiKey: trimmedApiKey,
            })

          setAnswer(result)
        } catch (err) {
          console.error('Screen AI failed:', err)

          setError(
            err instanceof Error
              ? err.message
              : 'Something went wrong.',
          )
        } finally {
          setCapturing(false)
          setThinking(false)
        }
      },
    )

    return removeListener
  }, [])

  return (
    <div
      className="screen-ai"
      style={{
        opacity: capturing ? 0 : 1,
      }}
    >
      <div className="capture-frame">

        {/* Header */}

        <div className="header">
          <span className="logo">
            Screen AI
          </span>

          <span>
            <label>
              AI Provider
            </label>

            <select
              value={provider}
              onChange={(event) =>
                handleProviderChange(
                  event.target.value as AIProvider,
                )
              }
            >
              <option value="gemini">
                Gemini
              </option>

              <option value="openai">
                OpenAI
              </option>
            </select>
          </span>

          <span>
            <label>
              Model
            </label>

            <select
              value={model}
              onChange={(event) =>
                setModel(event.target.value)
              }
            >
              {AI_MODELS[provider].map(
                (availableModel) => (
                  <option
                    key={availableModel.id}
                    value={availableModel.id}
                  >
                    {availableModel.name}
                  </option>
                ),
              )}
            </select>
          </span>

          <span>
            <label>
              API Key
            </label>

            <input
              type="password"
              value={apiKey}
              onChange={(event) =>
                setApiKey(event.target.value)
              }
              placeholder={
                provider === 'gemini'
                  ? 'Gemini API key'
                  : 'OpenAI API key'
              }
            />
          </span>

          <span className="status">
            {capturing
              ? 'Capturing...'
              : thinking
              ? 'Thinking...'
              : 'Ready'}
          </span>
        </div>

        <div
          className="center"
          ref={centerRef}
          tabIndex={0}
          onKeyDown={handleCenterKeyDown}
        >
          {thinking ? (
              <div className="thinking">
                <div className="spinner" />
                <div>Analyzing your screen...</div>
              </div>
            ) : answer ? (
              <div className="answer">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {answer}
                </ReactMarkdown>
              </div>
            ) : error ? (
              <div className="error">
                {error}
              </div>
            ) : (
              <>
                <div className="hint">
                  Resize this window over the content
                  you want AI to understand.
                </div>

                <div className="shortcut">
                  <kbd>⌘</kbd>
                  <kbd>Shift</kbd>
                  <kbd>Space</kbd>
                  <span>Ask AI</span>
                </div>
              </>
            )}
        </div>

        <div className="text-input-container">
          <input
            type="text"
            placeholder="Ask something..."
            value={textInput}
            onChange={(event) =>
              setTextInput(event.target.value)
            }
            onKeyDown={handleTextKeyDown}
          />
        </div>

      </div>
    </div>
  )
}

export default App