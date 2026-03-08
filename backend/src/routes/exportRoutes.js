import fs from "fs";
import path from "path";
import { Router } from "express";
import { asObjectId, getDb, toPublicList } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { config } from "../config/env.js";
import { compileReportText } from "../services/reportCompiler.js";
import { createGoogleDoc, generateDocx, generatePdf } from "../services/exportService.js";

const router = Router();

async function getCaseBundle(caseId) {
  const db = await getDb();
  const caseObjectId = asObjectId(caseId);
  if (!caseObjectId) return null;

  const caseData = await db.collection("cases").findOne({ _id: caseObjectId });
  if (!caseData) return null;

  const caseIdString = caseData._id.toString();
  const [report, suspectsDocs, chargesDocs, evidenceDocs] = await Promise.all([
    db.collection("reports").findOne({ case_id: caseIdString }),
    db.collection("suspects").find({ case_id: caseIdString }).toArray(),
    db.collection("charges").find({ case_id: caseIdString }).toArray(),
    db.collection("evidence").find({ case_id: caseIdString }).toArray()
  ]);

  const suspects = toPublicList(suspectsDocs);
  const suspectMap = new Map(suspects.map((s) => [s.id, s.full_name]));

  return {
    caseData: { ...caseData, id: caseData._id.toString() },
    report,
    suspects,
    charges: toPublicList(chargesDocs).map((c) => ({ ...c, suspect_name: suspectMap.get(c.suspect_id) || "Unknown" })),
    evidence: toPublicList(evidenceDocs).map((e) => ({
      ...e,
      suspect_name: e.suspect_id ? suspectMap.get(e.suspect_id) || null : null
    }))
  };
}

router.get("/:caseId/pdf", requireAuth, async (req, res) => {
  const bundle = await getCaseBundle(req.params.caseId);
  if (!bundle) return res.status(404).json({ message: "Case not found" });

  const text = compileReportText(bundle.caseData, bundle.report, bundle.suspects, bundle.charges, bundle.evidence);
  const filename = `case-${bundle.caseData.case_number}-report.pdf`;
  const outPath = await generatePdf(filename, text);
  res.download(outPath, filename);
});

router.get("/:caseId/docx", requireAuth, async (req, res) => {
  const bundle = await getCaseBundle(req.params.caseId);
  if (!bundle) return res.status(404).json({ message: "Case not found" });

  const text = compileReportText(bundle.caseData, bundle.report, bundle.suspects, bundle.charges, bundle.evidence);
  const filename = `case-${bundle.caseData.case_number}-report.docx`;
  const outPath = await generateDocx(filename, text);
  res.download(outPath, filename);
});

router.post("/:caseId/google-doc", requireAuth, async (req, res) => {
  if (!config.googleEnabled) {
    return res.status(404).json({ message: "Google Docs export disabled" });
  }

  const db = await getDb();
  const bundle = await getCaseBundle(req.params.caseId);
  if (!bundle) return res.status(404).json({ message: "Case not found" });

  const user = await db.collection("users").findOne({ _id: asObjectId(req.user.id) });
  if (!user?.google_access_token && !user?.google_refresh_token) {
    return res.status(400).json({ message: "Google account not connected" });
  }

  const text = compileReportText(bundle.caseData, bundle.report, bundle.suspects, bundle.charges, bundle.evidence);
  const link = await createGoogleDoc({
    title: `Case ${bundle.caseData.case_number} Report`,
    content: text,
    accessToken: user.google_access_token,
    refreshToken: user.google_refresh_token
  });

  return res.json({ link });
});

router.get("/:caseId/court-packet", requireAuth, async (req, res) => {
  const bundle = await getCaseBundle(req.params.caseId);
  if (!bundle) return res.status(404).json({ message: "Case not found" });

  const text = compileReportText(bundle.caseData, bundle.report, bundle.suspects, bundle.charges, bundle.evidence);
  const packetTitle = `Court Packet - ${bundle.caseData.case_number}`;
  const filename = `court-packet-${bundle.caseData.case_number}.pdf`;
  const outPath = await generatePdf(filename, `${packetTitle}\n\n${text}`);

  if (!fs.existsSync(outPath)) {
    return res.status(500).json({ message: "Unable to generate packet" });
  }

  return res.download(path.resolve(outPath), filename);
});

export default router;
