import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@deepgram/sdk";
import { put } from "@vercel/blob";
import { randomUUID } from "crypto";
import path from "path";
import { getDb, Chunk, Meeting } from "@/lib/mongodb";
import { chunkByTime, Word } from "@/lib/chunk";
import { embed } from "@/lib/gemini";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const title = (form.get("title") as string) || file?.name || "Untitled";
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const meetingId = randomUUID();
    const ext = path.extname(file.name) || ".mp3";

    // Upload audio to Vercel Blob instead of the local filesystem.
    // Serverless functions can't write to disk permanently, so this is
    // what lets uploads actually work once the app is deployed, not
    // just when running on your own machine.
    const blob = await put(`uploads/${meetingId}${ext}`, buffer, {
      access: "public",
      contentType: file.type || "audio/mpeg",
    });
    const audioUrl = blob.url;

    const dg = createClient(process.env.DEEPGRAM_API_KEY!);
    const { result, error } = await dg.listen.prerecorded.transcribeFile(buffer, {
      model: "nova-2",
      smart_format: true,
      diarize: true,
      punctuate: true,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const alt = result.results.channels[0].alternatives[0];
    const words: Word[] = alt.words.map((w) => ({
      word: w.punctuated_word ?? w.word,
      start: w.start,
      end: w.end,
      speaker: w.speaker,
    }));
    const duration = result.metadata.duration;

    const timeChunks = chunkByTime(words, 30, 5);

    // Small batches keep us under the embedding API rate limit.
    const docs: Chunk[] = [];
    const BATCH = 5;
    for (let i = 0; i < timeChunks.length; i += BATCH) {
      const batch = timeChunks.slice(i, i + BATCH);
      const embeddings = await Promise.all(batch.map((c) => embed(c.text)));
      batch.forEach((c, k) =>
        docs.push({ meetingId, ...c, embedding: embeddings[k] })
      );
    }

    const db = await getDb();
    const meeting: Meeting = { _id: meetingId, title, audioUrl, duration, createdAt: new Date() };
    await db.collection<Meeting>("meetings").insertOne(meeting);
    if (docs.length) await db.collection<Chunk>("chunks").insertMany(docs);

    return NextResponse.json({ meeting, chunkCount: docs.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Upload failed" }, { status: 500 });
  }
}