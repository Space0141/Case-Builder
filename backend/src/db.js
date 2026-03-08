import { MongoClient, ObjectId } from "mongodb";
import { config } from "./config/env.js";

let client;
let dbPromise;

function createClient() {
  const uri = config.mongodbUri;
  if (!uri || (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://"))) {
    throw new Error("Invalid or missing MONGODB_URI. Set mongodb://... or mongodb+srv://...");
  }
  return new MongoClient(uri);
}

export async function getDb() {
  if (!dbPromise) {
    client = createClient();
    dbPromise = client.connect().then(async () => {
      const db = client.db(config.mongodbDbName);
      await ensureIndexes(db);
      return db;
    });
  }
  return dbPromise;
}

async function ensureIndexes(db) {
  await Promise.all([
    db.collection("users").createIndex({ discord_id: 1 }, { unique: true }),
    db.collection("cases").createIndex({ case_number: 1 }, { unique: true, sparse: true }),
    db.collection("cases").createIndex({ updated_at: -1 }),
    db.collection("reports").createIndex({ case_id: 1 }, { unique: true }),
    db.collection("suspects").createIndex({ case_id: 1 }),
    db.collection("charges").createIndex({ case_id: 1 }),
    db.collection("evidence").createIndex({ case_id: 1 }),
    db.collection("timeline_events").createIndex({ case_id: 1 }),
    db.collection("report_comments").createIndex({ case_id: 1 })
  ]);
}

export function asObjectId(id) {
  if (!id) return null;
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

export function toPublic(doc) {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return { id: _id.toString(), ...rest };
}

export function toPublicList(docs) {
  return docs.map((doc) => toPublic(doc));
}

export async function nextSequence(name) {
  const db = await getDb();
  const result = await db.collection("counters").findOneAndUpdate(
    { _id: name },
    { $inc: { value: 1 } },
    { upsert: true, returnDocument: "after" }
  );
  return result.value?.value || 1;
}
