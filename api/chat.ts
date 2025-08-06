import type { VercelRequest, VercelResponse } from '@vercel/node'
import { GoogleGenAI } from '@google/genai'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { message } = req.body

  if (!message) {
    return res.status(400).json({ error: 'Message is required' })
  }

  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key not configured' })
  }

  try {
    const genAI = new GoogleGenAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    
    const result = await model.generateContent(message)
    const response = await result.response
    const text = response.text()

    return res.status(200).json({ response: text })
  } catch (error) {
    console.error('Error calling Gemini API:', error)
    return res.status(500).json({ error: 'Failed to get response from Gemini' })
  }
}