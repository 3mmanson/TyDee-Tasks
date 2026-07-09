const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

async function parseTaskFromText(text) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const prompt = `Parse the following natural language into a task. Return ONLY a JSON object with these fields:
- title (string, required): The task title
- description (string, optional): Additional details
- priority (string): "Low", "Medium", or "High"
- category (string): "Personal", "TyDee Tasks", or "DVK Print Shop"
- due_date (string|null): ISO date string if a date was mentioned, null otherwise

Current date: ${new Date().toISOString().split('T')[0]}

User input: "${text}"

Return ONLY valid JSON, no explanation.`;

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error: ${err}`);
  }

  const data = await response.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse AI response');

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    title: parsed.title || '',
    description: parsed.description || '',
    priority: ['Low', 'Medium', 'High'].includes(parsed.priority) ? parsed.priority : 'Medium',
    category: ['Personal', 'TyDee Tasks', 'DVK Print Shop'].includes(parsed.category) ? parsed.category : 'Personal',
    due_date: parsed.due_date || null,
  };
}

module.exports = { parseTaskFromText };
