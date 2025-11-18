import TextStatistics from "text-statistics";

export default async function handler(req, res) {
  // Hanya izinkan POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    /* ---------------------------------------------------------------------- */
    /* 🧠 Local Readability & Text Complexity                                  */
    /* ---------------------------------------------------------------------- */

    const stats = new TextStatistics(text);

    // readability metrics
    const readability = stats.fleschKincaidGradeLevel();
    const wordCount = text.split(/\s+/).length;
    const sentenceCount = text.split(/[.!?]/).filter(Boolean).length;

    const lexicalDensity =
      new Set(text.toLowerCase().match(/\b\w+\b/g)).size / wordCount;

    const localScore = Math.min(
      100,
      Math.max(0, readability * 3 + lexicalDensity * 100 - sentenceCount)
    );

    /* ---------------------------------------------------------------------- */
    /* 🤖 Call Groq API (AI)                                                  */
    /* ---------------------------------------------------------------------- */

    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`, // from Vercel Env
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: `
Return ONLY JSON like:
{"label":"AI","confidence":92,"reason":"Strong coherence"}

Analyze this text:
"""${text}"""
              `,
            },
          ],
          temperature: 0.2,
        }),
      }
    );

    const groqData = await groqRes.json();

    let aiAnalysis;

    try {
      aiAnalysis = JSON.parse(groqData?.choices?.[0]?.message?.content);
    } catch (err) {
      console.warn("⚠️ Invalid JSON from AI");
      aiAnalysis = { label: "AI", confidence: 50, reason: "Invalid JSON" };
    }

    /* ---------------------------------------------------------------------- */
    /* 🧩 Hybrid Score (Local + AI)                                           */
    /* ---------------------------------------------------------------------- */

    const hybridConfidence = Math.min(
      100,
      Math.max(0, aiAnalysis.confidence * 0.7 + localScore * 0.3)
    );

    const finalLabel =
      hybridConfidence > 60 && aiAnalysis.label === "AI" ? "AI" : "HUMAN";

    /* ---------------------------------------------------------------------- */
    /* 📤 Response                                                            */
    /* ---------------------------------------------------------------------- */

    return res.status(200).json({
      label: finalLabel,
      confidence: Math.round(hybridConfidence),
      reason:
        aiAnalysis.reason +
        ` | readability=${readability.toFixed(2)}, lexicalDensity=${lexicalDensity.toFixed(2)}`,
    });
  } catch (error) {
    console.error("❌ Serverless error:", error);
    return res.status(500).json({ error: error.message });
  }
}
