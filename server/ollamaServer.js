
import fetch from "node-fetch";
import dotenv from "dotenv";
import { createRequire } from "module";

dotenv.config();

const require = createRequire(import.meta.url);
const textstat = require("textstat");

const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// --- Local Text Complexity ---
function computeTextComplexity(text) {
  try {
    const readability = textstat.flesch_kincaid_grade(text);
    const sentenceCount = text.split(/[.!?]/).filter(Boolean).length;
    const wordCount = text.split(/\s+/).length;
    const lexicalDensity =
      new Set(text.toLowerCase().match(/\b\w+\b/g)).size / wordCount;

    const score = Math.min(
      100,
      Math.max(0, readability * 3 + lexicalDensity * 100 - sentenceCount)
    );

    return {
      readability: readability.toFixed(2),
      lexicalDensity: lexicalDensity.toFixed(2),
      score: Number(score.toFixed(2)),
    };
  } catch {
    return { readability: 0, lexicalDensity: 0, score: 0 };
  }
}

// --- Vercel API Route ---
export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Text is required" });

  const localScore = computeTextComplexity(text);

  const payload = {
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content: `
        Analyze the text and return only JSON:
        {"label": "AI", "confidence": 0, "reason": ""}
        Text:
        """${text}"""
        `,
      },
    ],
    temperature: 0.2,
    max_tokens: 250,
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    let aiAnalysis;
    try {
      aiAnalysis = JSON.parse(data.choices[0].message.content);
    } catch {
      aiAnalysis = {
        label: "ERROR",
        confidence: 0,
        reason: "Invalid JSON",
      };
    }

    const hybridConfidence = Math.min(
      100,
      Math.max(
        0,
        aiAnalysis.confidence * 0.7 + localScore.score * 0.3
      )
    );

    const finalLabel =
      hybridConfidence > 60 && aiAnalysis.label === "AI" ? "AI" : "HUMAN";

    res.json({
      label: finalLabel,
      confidence: Math.round(hybridConfidence),
      reason: `${aiAnalysis.reason} | Readability: ${localScore.readability}, LD: ${localScore.lexicalDensity}`,
    });
  } catch (err) {
    res.status(500).json({
      label: "ERROR",
      confidence: 0,
      reason: err.message,
    });
  }
}
