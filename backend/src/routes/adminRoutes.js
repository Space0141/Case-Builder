import { Router } from "express";
import { asObjectId, getDb, toPublicList } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/users", requireAuth, requireRole("Admin"), async (_req, res) => {
  const db = await getDb();
  const users = await db.collection("users").find({}).sort({ created_at: -1 }).toArray();
  res.json(toPublicList(users));
});

router.put("/users/:id/role", requireAuth, requireRole("Admin"), async (req, res) => {
  const db = await getDb();
  const userId = asObjectId(req.params.id);
  const { role } = req.body;
  if (!userId) return res.status(400).json({ message: "Invalid user id" });
  if (!["Admin", "Supervisor", "Officer"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  await db.collection("users").updateOne({ _id: userId }, { $set: { role, updated_at: new Date() } });
  const user = await db.collection("users").findOne({ _id: userId });

  res.json({ id: user._id.toString(), username: user.username, role: user.role });
});

router.get("/settings", requireAuth, requireRole("Admin"), async (_req, res) => {
  const db = await getDb();
  const settings = await db.collection("system_settings").find({}).sort({ key: 1 }).toArray();
  res.json(toPublicList(settings));
});

router.put("/settings", requireAuth, requireRole("Admin"), async (req, res) => {
  const db = await getDb();
  const entries = Object.entries(req.body || {});

  for (const [key, value] of entries) {
    await db.collection("system_settings").updateOne(
      { key },
      { $set: { key, value: String(value), updated_at: new Date() } },
      { upsert: true }
    );
  }

  res.json({ success: true });
});

export default router;
