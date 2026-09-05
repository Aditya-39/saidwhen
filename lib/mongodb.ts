import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI!;
let cached: Promise<MongoClient> | null = null;

export async function getDb(): Promise<Db> {
  if (!cached) cached = new MongoClient(uri).connect();
  return (await cached).db(process.env.MONGODB_DB || "echovault");
}

export type Chunk = {
  meetingId: string;
  text: string;
  start: number;
  end: number;
  speakers: number[];
  embedding: number[];
};

export type Meeting = {
  _id: string;
  title: string;
  audioUrl: string;
  duration: number;
  createdAt: Date;
};