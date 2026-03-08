import { Router } from "express";
import { asObjectId, getDb, nextSequence, toPublic, toPublicList } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { addTimelineEvent, getTimeline } from "../services/timelineService.js";

const router = Router();

function makeCaseNumber(sequence) {
  const year = new Date().getFullYear();
  return `CB-${year}-${String(sequence).padStart(6, "0")}`;
}

router.get("/", requireAuth, async (req, res) => {
  const db = await getDb();
  const { caseNumber, officer, suspectName, date, status } = req.query;

  const filter = {};
  if (caseNumber) filter.case_number = { $regex: caseNumber, $options: "i" };
  if (officer) filter.reporting_officer = { $regex: officer, $options: "i" };
  if (status) filter.case_status = status;

  if (date) {
    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(`${date}T23:59:59.999Z`);
    filter.incident_datetime = { $gte: start, $lte: end };
  }

  if (suspectName) {
    const suspectCaseIds = await db
      .collection("suspects")
      .find({ full_name: { $regex: suspectName, $options: "i" } }, { projection: { case_id: 1 } })
      .toArray();

    const ids = [...new Set(suspectCaseIds.map((s) => s.case_id))];
    filter._id = { $in: ids.map((id) => asObjectId(id)).filter(Boolean) };
  }

  const cases = await db.collection("cases").find(filter).sort({ updated_at: -1 }).toArray();
  const caseIds = cases.map((c) => c._id.toString());

  const [suspectCounts, evidenceCounts] = await Promise.all([
    db
      .collection("suspects")
      .aggregate([{ $match: { case_id: { $in: caseIds } } }, { $group: { _id: "$case_id", total: { $sum: 1 } } }])
      .toArray(),
    db
      .collection("evidence")
      .aggregate([{ $match: { case_id: { $in: caseIds } } }, { $group: { _id: "$case_id", total: { $sum: 1 } } }])
      .toArray()
  ]);

  const suspectMap = new Map(suspectCounts.map((x) => [x._id, x.total]));
  const evidenceMap = new Map(evidenceCounts.map((x) => [x._id, x.total]));

  const response = toPublicList(cases).map((c) => ({
    ...c,
    suspect_count: suspectMap.get(c.id) || 0,
    evidence_count: evidenceMap.get(c.id) || 0
  }));

  res.json(response);
});

router.post("/", requireAuth, requireRole("Officer", "Supervisor", "Admin"), async (req, res) => {
  const db = await getDb();
  const {
    caseTitle,
    incidentType,
    incidentLocation,
    incidentDatetime,
    reportingOfficer,
    unitsInvolved,
    caseStatus = "Open"
  } = req.body;

  const sequence = await nextSequence("caseSequence");
  const now = new Date();
  const caseDoc = {
    case_number: makeCaseNumber(sequence),
    case_title: caseTitle,
    incident_type: incidentType,
    incident_location: incidentLocation,
    incident_datetime: new Date(incidentDatetime),
    reporting_officer: reportingOfficer,
    units_involved: unitsInvolved,
    case_status: caseStatus,
    created_by: req.user.id,
    created_at: now,
    updated_at: now
  };

  const insertResult = await db.collection("cases").insertOne(caseDoc);
  const caseId = insertResult.insertedId.toString();

  await db.collection("reports").insertOne({
    case_id: caseId,
    incident_overview: "",
    dispatch_call_information: "",
    suspect_information: "",
    victim_information: "",
    witness_statements: "",
    evidence_collected: "",
    probable_cause: "",
    charges: "",
    officer_narrative: "",
    use_of_force: "",
    arrest_details: "",
    updated_by: req.user.id,
    updated_at: now
  });

  await addTimelineEvent(caseId, "Dispatch received", "Case initialized in RMS");

  const created = await db.collection("cases").findOne({ _id: insertResult.insertedId });
  res.status(201).json(toPublic(created));
});

router.get("/:id", requireAuth, async (req, res) => {
  const db = await getDb();
  const caseObjectId = asObjectId(req.params.id);
  if (!caseObjectId) {
    return res.status(404).json({ message: "Case not found" });
  }

  const caseDoc = await db.collection("cases").findOne({ _id: caseObjectId });
  if (!caseDoc) {
    return res.status(404).json({ message: "Case not found" });
  }

  const caseId = caseDoc._id.toString();

  const [suspectsDocs, chargesDocs, evidenceDocs, reportDoc, timeline] = await Promise.all([
    db.collection("suspects").find({ case_id: caseId }).sort({ created_at: 1 }).toArray(),
    db.collection("charges").find({ case_id: caseId }).sort({ created_at: 1 }).toArray(),
    db.collection("evidence").find({ case_id: caseId }).sort({ uploaded_at: -1 }).toArray(),
    db.collection("reports").findOne({ case_id: caseId }),
    getTimeline(caseId)
  ]);

  const suspects = toPublicList(suspectsDocs);
  const suspectMap = new Map(suspects.map((s) => [s.id, s.full_name]));

  const charges = toPublicList(chargesDocs).map((charge) => ({
    ...charge,
    suspect_name: suspectMap.get(charge.suspect_id) || "Unknown"
  }));

  const evidence = toPublicList(evidenceDocs).map((item) => ({
    ...item,
    suspect_name: item.suspect_id ? suspectMap.get(item.suspect_id) || null : null
  }));

  return res.json({
    case: toPublic(caseDoc),
    suspects,
    charges,
    evidence,
    report: toPublic(reportDoc),
    timeline
  });
});

router.put("/:id", requireAuth, requireRole("Officer", "Supervisor", "Admin"), async (req, res) => {
  const db = await getDb();
  const caseObjectId = asObjectId(req.params.id);
  if (!caseObjectId) {
    return res.status(404).json({ message: "Case not found" });
  }

  const {
    caseTitle,
    incidentType,
    incidentLocation,
    incidentDatetime,
    reportingOfficer,
    unitsInvolved,
    caseStatus
  } = req.body;

  await db.collection("cases").updateOne(
    { _id: caseObjectId },
    {
      $set: {
        case_title: caseTitle,
        incident_type: incidentType,
        incident_location: incidentLocation,
        incident_datetime: new Date(incidentDatetime),
        reporting_officer: reportingOfficer,
        units_involved: unitsInvolved,
        case_status: caseStatus,
        updated_at: new Date()
      }
    }
  );

  const updated = await db.collection("cases").findOne({ _id: caseObjectId });
  if (!updated) {
    return res.status(404).json({ message: "Case not found" });
  }

  await addTimelineEvent(updated._id.toString(), "Investigation actions", `Case updated by ${req.user.username}`);
  res.json(toPublic(updated));
});

router.post("/:id/suspects", requireAuth, requireRole("Officer", "Supervisor", "Admin"), async (req, res) => {
  const db = await getDb();
  const caseObjectId = asObjectId(req.params.id);
  const caseDoc = caseObjectId ? await db.collection("cases").findOne({ _id: caseObjectId }) : null;
  if (!caseDoc) {
    return res.status(404).json({ message: "Case not found" });
  }

  const { fullName, alias, description, arrestStatus, notes } = req.body;
  const suspect = {
    case_id: caseDoc._id.toString(),
    full_name: fullName,
    alias,
    description,
    arrest_status: arrestStatus,
    notes,
    created_at: new Date()
  };

  const insert = await db.collection("suspects").insertOne(suspect);
  const created = await db.collection("suspects").findOne({ _id: insert.insertedId });

  await addTimelineEvent(caseDoc._id.toString(), "Investigation actions", `Suspect added: ${fullName}`);
  res.status(201).json(toPublic(created));
});

router.post("/:id/charges", requireAuth, requireRole("Officer", "Supervisor", "Admin"), async (req, res) => {
  const db = await getDb();
  const caseObjectId = asObjectId(req.params.id);
  const caseDoc = caseObjectId ? await db.collection("cases").findOne({ _id: caseObjectId }) : null;
  if (!caseDoc) {
    return res.status(404).json({ message: "Case not found" });
  }

  const { suspectId, statuteCode, chargeTitle, statuteText, explanation } = req.body;
  const charge = {
    case_id: caseDoc._id.toString(),
    suspect_id: suspectId,
    statute_code: statuteCode,
    charge_title: chargeTitle,
    statute_text: statuteText,
    explanation,
    created_at: new Date()
  };

  const insert = await db.collection("charges").insertOne(charge);
  const created = await db.collection("charges").findOne({ _id: insert.insertedId });

  await addTimelineEvent(caseDoc._id.toString(), "Arrest event", `Charge filed: ${chargeTitle}`);
  res.status(201).json(toPublic(created));
});

router.get("/:id/timeline", requireAuth, async (req, res) => {
  const timeline = await getTimeline(req.params.id);
  res.json(timeline);
});

export default router;
