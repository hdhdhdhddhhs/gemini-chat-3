export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Missing Gemini API key" });
  }

  const prompt = req.body.prompt || "Hello Gemini!"; // ✅ this is the fix

  try {
   const response = await fetch(
  `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();

    if (data.candidates) {
      const reply = data.candidates[0]?.content?.parts[0]?.text || "No response";
      res.status(200).json({ reply });
    } else {
      console.error("Gemini API error:", data);
      res.status(500).json({ error: "No candidates returned", details: data });
    }
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: "Request failed", details: err.message });
  }
}
