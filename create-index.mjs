import { MongoClient } from "mongodb";
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8").split("\n")
    .filter(l => l.includes("=")).map(l => l.split(/=(.*)/s).slice(0, 2).map(s => s.trim()))
);

const client = new MongoClient(env.MONGODB_URI);
await client.connect();
const col = client.db(env.MONGODB_DB || "echovault").collection("chunks");

const name = await col.createSearchIndex({
  name: "chunk_vector_index",
  type: "vectorSearch",
  definition: {
    fields: [
      { type: "vector", path: "embedding", numDimensions: 768, similarity: "cosine" },
      { type: "filter", path: "meetingId" },
    ],
  },
});
console.log("Created:", name);
await client.close();