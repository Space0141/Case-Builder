import { Router } from "express";
import { google } from "googleapis";
import { config } from "../config/env.js";
import { requireAuth } from "../middleware/auth.js";
import { asObjectId, getDb } from "../db.js";

const router = Router();

function getClient() {
  return new google.auth.OAuth2(
    config.google.clientId,
    config.google.clientSecret,
    config.google.redirectUri
  );
}

router.get("/connect", requireAuth, (req, res) => {
  if (!config.googleEnabled) {
    return res.status(404).json({ message: "Google Docs export disabled" });
  }

  const client = getClient();
  const url = client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/documents", "https://www.googleapis.com/auth/drive.file"],
    prompt: "consent"
  });
  return res.json({ url });
});

router.get("/callback", requireAuth, async (req, res) => {
  if (!config.googleEnabled) {
    return res.status(404).json({ message: "Google Docs export disabled" });
  }

  const db = await getDb();
  const code = req.query.code;
  const client = getClient();
  const { tokens } = await client.getToken(code);

  const setDoc = {
    google_access_token: tokens.access_token,
    google_token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
    updated_at: new Date()
  };

  if (tokens.refresh_token) {
    setDoc.google_refresh_token = tokens.refresh_token;
  }

  await db.collection("users").updateOne({ _id: asObjectId(req.user.id) }, { $set: setDoc });

  return res.redirect(`${config.frontendUrl}/settings?google=connected`);
});

export default router;
