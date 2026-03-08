import express from "express";
import session from "express-session";
import cors from "cors";
import helmet from "helmet";
import passport from "passport";
import path from "path";
import { fileURLToPath } from "url";

import { config } from "./config/env.js";
import { configurePassport } from "./config/passport.js";

import authRoutes from "./routes/authRoutes.js";
import googleRoutes from "./routes/googleRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import caseRoutes from "./routes/caseRoutes.js";
import evidenceRoutes from "./routes/evidenceRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import exportRoutes from "./routes/exportRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

configurePassport();

export const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 1000 * 60 * 60 * 24
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/uploads", express.static(path.resolve(__dirname, "..", "uploads")));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "case-builder-backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/google", googleRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/cases", caseRoutes);
app.use("/api/evidence", evidenceRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/exports", exportRoutes);
app.use("/api/admin", adminRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "Internal server error" });
});
