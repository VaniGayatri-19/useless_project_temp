require("dotenv").config();

const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

app.post("/api/split", async (req, res) => {
  const decision = req.body.decision;

  if (!decision) {
    return res.status(400).json({ error: "Please provide a decision." });
  }

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: "Groq API key is missing from .env." });
  }

  const prompt = `
You are the AI engine for a fun interactive website called "Parallel Universe You".

The user has entered this life decision:

"${decision}"

Create three timelines:

REALITY A: The path the user actually took.
REALITY B: The path where they made the opposite or alternative choice.
REALITY C: The wildest, funniest, most unexpected alternate timeline.

Make the results creative, specific to the decision, entertaining, slightly dramatic,
funny when appropriate, believable enough to feel like an alternate life, suitable
for a college hackathon, and NOT scary or depressing.

For each reality provide:
- title
- description
- now
- twoYears
- fiveYears
- happiness (integer 0-100)
- wealth (integer 0-100)
- stress (integer 0-100)
- chaos (integer 0-100)

Then decide which single reality (A, B, or C) "wins" overall — the most enviable
or interesting life — and write a short, funny one-sentence verdict explaining why
(e.g. "Apparently, engineering was just a side quest.").

Return ONLY valid JSON in exactly this structure, with no extra text before or after it:

{
  "realityA": { "title": "...", "description": "...", "now": "...", "twoYears": "...", "fiveYears": "...", "happiness": 0, "wealth": 0, "stress": 0, "chaos": 0 },
  "realityB": { "title": "...", "description": "...", "now": "...", "twoYears": "...", "fiveYears": "...", "happiness": 0, "wealth": 0, "stress": 0, "chaos": 0 },
  "realityC": { "title": "...", "description": "...", "now": "...", "twoYears": "...", "fiveYears": "...", "happiness": 0, "wealth": 0, "stress": 0, "chaos": 0 },
  "battle": { "winner": "A", "verdict": "..." }
}
`;

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [
            { role: "system", content: "You always reply with ONLY valid JSON, no markdown, no extra text." },
            { role: "user", content: prompt }
          ],
          temperature: 1.1,
          max_completion_tokens: 1500,
          response_format: { type: "json_object" }
        })
      }
    );

    const rawText = await response.text();

    if (!response.ok) {
      console.error(`Groq API Error [${response.status}]:`, rawText);
      return res.status(response.status).json({
        error: `Groq API error (${response.status})`,
        details: rawText
      });
    }

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      console.error("Failed to parse Groq's outer response:", rawText);
      return res.status(500).json({ error: "Groq returned unparseable data." });
    }

    const generatedText = data.choices?.[0]?.message?.content;

    if (!generatedText) {
      console.error("No text in Groq response:", JSON.stringify(data));
      return res.status(500).json({ error: "Groq returned an empty response." });
    }

    let realities;
    try {
      realities = JSON.parse(generatedText);
    } catch {
      console.error("Failed to parse Groq's JSON content:", generatedText);
      return res.status(500).json({ error: "Groq's reply wasn't valid JSON." });
    }

    res.json(realities);

  } catch (error) {
    console.error("Server/network error:", error);
    res.status(500).json({ error: "Server error: " + error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Parallel Universe You running at http://localhost:${PORT}`);
});