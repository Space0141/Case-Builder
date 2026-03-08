import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getDb, toPublicList, asObjectId } from "../db.js";

const router = Router();

router.get("/summary", requireAuth, async (_req, res) => {
  const db = await getDb();

  const [totalActiveCases, recentCasesDocs, evidenceDocs, statusAgg] = await Promise.all([
    db.collection("cases").countDocuments({ case_status: { $ne: "Closed" } }),
    db
      .collection("cases")
      .find({}, { projection: { case_number: 1, case_title: 1, case_status: 1, updated_at: 1 } })
      .sort({ updated_at: -1 })
      .limit(8)
      .toArray(),
    db
      .collection("evidence")
      .find({}, { projection: { evidence_name: 1, uploaded_at: 1, case_id: 1 } })
      .sort({ uploaded_at: -1 })
      .limit(8)
      .toArray(),
    db.collection("cases").aggregate([{ $group: { _id: "$case_status", total: { $sum: 1 } } }]).toArray()
  ]);

  const evidenceCaseObjectIds = [...new Set(evidenceDocs.map((e) => asObjectId(e.case_id)).filter(Boolean))];
  const evidenceCases = evidenceCaseObjectIds.length
    ? await db
        .collection("cases")
        .find({ _id: { $in: evidenceCaseObjectIds } }, { projection: { case_number: 1 } })
        .toArray()
    : [];

  const caseNumberMap = new Map(evidenceCases.map((c) => [c._id.toString(), c.case_number]));

  const evidenceUploads = toPublicList(evidenceDocs).map((item) => ({
    ...item,
    case_number: caseNumberMap.get(item.case_id) || "Unknown"
  }));

  res.json({
    totalActiveCases,
    recentlyUpdatedCases: toPublicList(recentCasesDocs),
    evidenceUploads,
    caseStatistics: statusAgg.map((s) => ({ case_status: s._id, total: s.total }))
  });
});

export default router;
