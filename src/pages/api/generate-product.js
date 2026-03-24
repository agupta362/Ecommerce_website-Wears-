// src/pages/api/generate-product.js
import OpenAI from "openai";

export async function POST(req, res) {
  try {
    const { caption } = await req.json();

    if (!caption) return res.status(400).json({ error: "No caption provided" });

    const openai = new OpenAI({ apiKey: import.meta.env.VITE_OPENAI_API_KEY });

    const prompt = `
Extract product info from this Instagram caption:

"${caption}"

Return JSON:
{
  "name": "",
  "category": "",
  "colors": [],
  "description": ""
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.choices[0].message?.content;

    // Make sure it’s valid JSON
    let data;
    try {
      data = JSON.parse(content);
    } catch {
      return res.status(500).json({ error: "AI returned invalid JSON" });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "AI generation failed" });
  }
}