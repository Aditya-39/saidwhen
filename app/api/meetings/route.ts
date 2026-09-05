import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDb();
    const meetings = await db.collection("meetings")
      .find({}, { projection: { title: 1, audioUrl: 1, duration: 1 } })
      .sort({ createdAt: -1 })
      .toArray();
    return NextResponse.json(meetings);
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Failed to load meetings" }, { status: 500 });
  }
}