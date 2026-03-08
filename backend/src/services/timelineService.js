import { getDb, toPublicList } from "../db.js";

export async function addTimelineEvent(caseId, eventType, details) {
  const db = await getDb();
  await db.collection("timeline_events").insertOne({
    case_id: caseId,
    event_type: eventType,
    details,
    created_at: new Date()
  });
}

export async function getTimeline(caseId) {
  const db = await getDb();
  const rows = await db
    .collection("timeline_events")
    .find({ case_id: caseId })
    .sort({ created_at: 1 })
    .toArray();
  return toPublicList(rows);
}
