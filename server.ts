import express from 'express'
import { createServer as createViteServer } from 'vite'
import path from 'path'
import { GoogleGenAI, Type } from '@google/genai'

const app = express()
const PORT = 3000

app.use(express.json({ limit: '15mb' }))

// Shared Gemini Client
let geminiClient: GoogleGenAI | null = null
if (process.env.GEMINI_API_KEY) {
  geminiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  })
}

// Receipt parsing endpoint
app.post('/api/parse-receipt', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body

    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing imageBase64 in request body' })
    }

    // Clean base64 string if data URL prefix was sent
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '')

    if (!geminiClient) {
      return res.json({
        success: false,
        source: 'local-fallback',
        message: 'GEMINI_API_KEY not configured. Falling back to structured heuristic OCR.',
      })
    }

    // Call Gemini 3.8 Flash Vision model
    const response = await geminiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: cleanBase64,
            },
          },
          {
            text: `You are an expert financial receipt parser for Pocket Lens.
Analyze this receipt/invoice/slip image carefully and extract all transaction details.
Ensure the extracted amount represents the final total (including taxes and discounts).
Classify the category into one of: 'Bills & Utilities', 'Subscriptions', 'Food & Dining', 'Shopping', 'Groceries', 'Transportation', 'Entertainment', 'Health & Wellness', 'Income', 'Other'.
Format date as YYYY-MM-DD (e.g. 2023-07-21). If year is not obvious, use the current or most recent year.
Detect whether this is an 'expense' or 'income'. Defaults to 'expense' unless explicitly marked as refund, deposit, invoice payment received, or payroll.`,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            merchant: {
              type: Type.STRING,
              description: 'The merchant, store, vendor, or entity name (e.g., Spotify, Starbucks, Target, Trader Joe\'s).',
            },
            amount: {
              type: Type.NUMBER,
              description: 'The final total transaction amount as a positive number (e.g. 4.99, 313.31).',
            },
            date: {
              type: Type.STRING,
              description: 'Date in YYYY-MM-DD format (e.g. 2023-07-21).',
            },
            type: {
              type: Type.STRING,
              description: "Must be either 'expense' or 'income'.",
            },
            category: {
              type: Type.STRING,
              description: "Category matching the expenditure (e.g. 'Bills & Utilities', 'Subscriptions', 'Food & Dining', 'Shopping', 'Groceries', 'Entertainment', 'Income').",
            },
            items: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Optional line items or description notes found on the receipt.',
            },
            confidence: {
              type: Type.NUMBER,
              description: 'Confidence score between 0.0 and 1.0.',
            },
          },
          required: ['merchant', 'amount', 'date', 'type', 'category'],
        },
      },
    })

    const rawText = response.text?.trim()
    if (!rawText) {
      throw new Error('Empty response from vision model')
    }

    const parsedData = JSON.parse(rawText)
    return res.json({
      success: true,
      source: 'gemini-vision',
      data: parsedData,
    })
  } catch (err: any) {
    console.error('Error in /api/parse-receipt:', err)
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to parse receipt with vision AI',
    })
  }
})

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production'

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0' },
      appType: 'spa',
    })
    app.use(vite.middlewares)
  } else {
    const distPath = path.resolve('dist')
    app.use(express.static(distPath))
    app.use('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'))
    })
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Pocket Lens / Catalyst server running on http://0.0.0.0:${PORT}`)
  })
}

startServer()
