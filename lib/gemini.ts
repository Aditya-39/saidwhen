import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const embedder = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
const llm = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

// Gemini's embedding model treats queries and documents differently;
// using the matching task type improves retrieval. 768 dims matches the
// Atlas vector index.
export async function embed(text: string, forQuery = false): Promise<number[]> {
  const res = await embedder.embedContent({
    content: { role: "user", parts: [{ text }] },
    taskType: forQuery ? "RETRIEVAL_QUERY" : "RETRIEVAL_DOCUMENT",
    outputDimensionality: 768,
  } as any);
  return res.embedding.values;
}

const fmt = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export async function answerGrounded(
  question: string,
  chunks: { text: string; start: number; end: number }[],
  grounded = true
) {
  const context = chunks
    .map((c, i) => `[${i + 1}] (${fmt(c.start)}–${fmt(c.end)}) ${c.text}`)
    .join("\n\n");

  const prompt = grounded
    ? `You answer questions about a meeting using ONLY the transcript excerpts below.
Rules:
- If the answer is not in the excerpts, say "I couldn't find that in the meeting."
- Every claim must cite its source like [2]. Never invent details or timestamps.
- Be concise.

TRANSCRIPT EXCERPTS:
${context}

QUESTION: ${question}`
    : `Here are some notes from a meeting:

${context}

Question: ${question}`;

  const res = await llm.generateContent(prompt);
  return res.response.text();
}