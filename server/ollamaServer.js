import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import { createRequire } from "module";

dotenv.config(); // ← penting!

const require = createRequire(import.meta.url);
const textstat = require("textstat");

const app = express();
app.use(cors());
app.use(express.json());

const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = process.env.GROQ_API_KEY;

/* -------------------------------------------------------------------------- */
/* 🧩 Utility: Skor kompleksitas teks lokal                                   */
/* -------------------------------------------------------------------------- */
function computeTextComplexity(text) {
  try {
    const readability = textstat.flesch_kincaid_grade(text);
    const sentenceCount = text.split(/[.!?]/).filter(Boolean).length;
    const wordCount = text.split(/\s+/).length;

    const lexicalDensity = (new Set(text.toLowerCase().match(/\b\w+\b/g))).size / wordCount;

    const score =
      Math.min(100, Math.max(0, readability * 3 + lexicalDensity * 100 - sentenceCount));

    return {
      readability: readability.toFixed(2),
      lexicalDensity: lexicalDensity.toFixed(2),
      score: Number(score.toFixed(2)),
    };
  } catch (err) {
    console.error("❌ Complexity calc failed:", err);
    return { readability: 0, lexicalDensity: 0, score: 0 };
  }
}

/* -------------------------------------------------------------------------- */
/* 🚀 Endpoint utama: analisis teks                                           */
/* -------------------------------------------------------------------------- */
app.post("/api/analyze", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });

    const localScore = computeTextComplexity(text);

    const payload = {
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `
You are an expert AI text origin analyzer.
Analyze the text below and predict whether it was written by a HUMAN or an AI.

Return ONLY valid JSON:
{"label": "AI", "confidence": 92, "reason": "Perfect grammar"}
Text:
"""${text}"""
          `,
        },
      ],
      temperature: 0.2,
      max_tokens: 250,
    };

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`, // FIXED
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!data?.choices?.[0]?.message?.content) {
      console.error("❌ No valid response:", data);
      return res
        .status(500)
        .json({ label: "ERROR", confidence: 0, reason: "Invalid response from API" });
    }

    let aiAnalysis;
    try {
      aiAnalysis = JSON.parse(data.choices[0].message.content);
    } catch (err) {
      console.warn("⚠️ Invalid JSON returned by model");
      aiAnalysis = { label: "ERROR", confidence: 0, reason: "Invalid JSON format from model" };
    }

    const hybridConfidence = Math.min(
      100,
      Math.max(
        0,
        (Number(aiAnalysis.confidence || 0) * 0.7 + localScore.score * 0.3)
      )
    );

    const finalLabel =
      hybridConfidence > 60 && aiAnalysis.label === "AI" ? "AI" : "HUMAN";

    const finalResult = {
      label: finalLabel,
      confidence: Math.round(hybridConfidence),
      reason: `${aiAnalysis.reason} | Local readability: ${localScore.readability}, lexical density: ${localScore.lexicalDensity}`,
    };

    console.log("🧩 Final Hybrid Output:", finalResult);
    res.json(finalResult);
  } catch (err) {
    console.error("❌ Failed to process:", err);
    res
      .status(500)
      .json({ label: "ERROR", confidence: 0, reason: err.message || "Internal error" });
  }
});

app.listen(3001, () => console.log("🚀 AI Hybrid Server running at http://localhost:3001"));
