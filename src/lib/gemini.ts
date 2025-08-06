import { GoogleGenAI } from '@google/genai'

const apiKey = import.meta.env.VITE_GEMINI_API_KEY

if (!apiKey) {
  console.error('VITE_GEMINI_API_KEY is not set')
}

const genAI = new GoogleGenAI(apiKey || '')

export async function chatWithGemini(message: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    const result = await model.generateContent(message)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Error calling Gemini API:', error)
    throw new Error('Failed to get response from Gemini')
  }
}