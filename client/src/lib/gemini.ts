import { GoogleGenAI } from "@google/genai";

// This would be used if we need client-side Gemini calls
// For now, all API calls go through our backend
const ai = new GoogleGenAI({ 
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || "" 
});

export async function generateResponse(prompt: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate response");
  }
}

export { ai };
