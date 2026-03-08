import { Router } from "express";
import { asObjectId, getDb, toPublic, toPublicList } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { addTimelineEvent } from "../services/timelineService.js";

const router = Router();

router.get("/:caseId", requireAuth, async (req, res) => {
  const db = await getDb();
  const report = await db.collection("reports").findOne({ case_id: req.params.caseId });
  if (!report) {
    return res.status(404).json({ message: "Report not found" });
  }
  return res.json(toPublic(report));
});

router.put("/:caseId", requireAuth, requireRole("Officer", "Supervisor", "Admin"), async (req, res) => {
  const db = await getDb();
  const caseId = req.params.caseId;
  const fields = [
    "incident_overview",
    "dispatch_call_information",
    "suspect_information",
    "victim_information",
    "witness_statements",
    "evidence_collected",
    "probable_cause",
    "charges",
    "officer_narrative",
    "use_of_force",
    "arrest_details"
  ];

  const setDoc = {
    updated_by: req.user.id,
    updated_at: new Date()
  };

  for (const field of fields) {
    setDoc[field] = req.body[field] || "";
  }

  await db.collection("reports").updateOne({ case_id: caseId }, { $set: setDoc }, { upsert: true });
  const report = await db.collection("reports").findOne({ case_id: caseId });

  await addTimelineEvent(caseId, "Investigation actions", `Report updated by ${req.user.username}`);
  res.json(toPublic(report));
});

router.post("/:caseId/comments", requireAuth, requireRole("Supervisor", "Admin"), async (req, res) => {
  const db = await getDb();
  const caseId = req.params.caseId;
  const { comment } = req.body;

  const insert = await db.collection("report_comments").insertOne({
    case_id: caseId,
    user_id: req.user.id,
    comment,
    created_at: new Date()
  });

  const created = await db.collection("report_comments").findOne({ _id: insert.insertedId });
  await addTimelineEvent(caseId, "Investigation actions", "Supervisor comment added");
  res.status(201).json(toPublic(created));
});

router.get("/:caseId/comments", requireAuth, async (req, res) => {
  const db = await getDb();
  const caseId = req.params.caseId;

  const commentsDocs = await db
    .collection("report_comments")
    .find({ case_id: caseId })
    .sort({ created_at: -1 })
    .toArray();

  const comments = toPublicList(commentsDocs);
  const userObjectIds = comments.map((c) => asObjectId(c.user_id)).filter(Boolean);
  const usersDocs = userObjectIds.length
    ? await db.collection("users").find({ _id: { $in: userObjectIds } }).toArray()
    : [];

  const userMap = new Map(usersDocs.map((u) => [u._id.toString(), u.username]));
  res.json(comments.map((c) => ({ ...c, username: userMap.get(c.user_id) || "Unknown" })));
});

export default router;
