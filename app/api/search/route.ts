import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { embed, answerGrounded } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { query, meetingId, k = 5, grounded = true } = await req.json();
    if (!query) return NextResponse.json({ error: "Missing query" }, { status: 400 });

    const qVec = await embed(query, true);
    const db = await getDb();

    const results = await db.collection("chunks").aggregate([
      {
        $vectorSearch: {
          index: "chunk_vector_index",
          path: "embedding",
          queryVector: qVec,
          numCandidates: 100,
          limit: k,
          ...(meetingId && { filter: { meetingId } }),
        },
      },
      {
        $project: {
          _id: 0, meetingId: 1, text: 1, start: 1, end: 1, speakers: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ]).toArray();

    const answer = results.length
      ? await answerGrounded(query, results as any, grounded)
      : "No relevant segments found.";

    return NextResponse.json({ answer, results });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Search failed" }, { status: 500 });
  }
}