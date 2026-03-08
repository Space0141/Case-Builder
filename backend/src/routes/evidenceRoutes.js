import fs from "fs";
import path from "path";
import multer from "multer";
import { Router } from "express";
import { asObjectId, getDb, toPublic, toPublicList } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { addTimelineEvent } from "../services/timelineService.js";

const uploadRoot = path.resolve(process.cwd(), "backend", "uploads", "evidence");
fs.mkdirSync(uploadRoot, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadRoot),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safe}`);
  }
});

const upload = multer({ storage });
const router = Router();

router.get("/:caseId", requireAuth, async (req, res) => {
  const db = await getDb();
  const caseId = req.params.caseId;

  const [evidenceDocs, suspectsDocs] = await Promise.all([
    db.collection("evidence").find({ case_id: caseId }).sort({ uploaded_at: -1 }).toArray(),
    db.collection("suspects").find({ case_id: caseId }).toArray()
  ]);

  const suspectMap = new Map(suspectsDocs.map((s) => [s._id.toString(), s.full_name]));
  const evidence = toPublicList(evidenceDocs).map((item) => ({
    ...item,
    suspect_name: item.suspect_id ? suspectMap.get(item.suspect_id) || null : null
  }));

  res.json(evidence);
});

router.post(
  "/:caseId/upload",
  requireAuth,
  requireRole("Officer", "Supervisor", "Admin"),
  upload.single("file"),
  async (req, res) => {
    const db = await getDb();
    const caseObjectId = asObjectId(req.params.caseId);
    const caseDoc = caseObjectId ? await db.collection("cases").findOne({ _id: caseObjectId }) : null;

    if (!caseDoc) {
      return res.status(404).json({ message: "Case not found" });
    }

    const caseId = caseDoc._id.toString();
    const { evidenceName, description, suspectId } = req.body;

    const doc = {
      case_id: caseId,
      suspect_id: suspectId || null,
      evidence_name: evidenceName,
      description,
      file_path: req.file.path,
      file_type: req.file.mimetype,
      uploaded_by: req.user.id,
      uploaded_at: new Date()
    };

    const insert = await db.collection("evidence").insertOne(doc);
    const created = await db.collection("evidence").findOne({ _id: insert.insertedId });

    await addTimelineEvent(caseId, "Evidence collected", `Evidence uploaded: ${evidenceName}`);

    res.status(201).json(toPublic(created));
  }
);

export default router;
