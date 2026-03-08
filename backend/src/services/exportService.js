import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { Document, Packer, Paragraph, HeadingLevel } from "docx";
import { google } from "googleapis";
import { config } from "../config/env.js";

const exportsDir = path.resolve(process.cwd(), "backend", "uploads", "exports");
fs.mkdirSync(exportsDir, { recursive: true });

export async function generatePdf(filename, text) {
  const outPath = path.join(exportsDir, filename);
  const doc = new PDFDocument({ margin: 40 });
  const stream = fs.createWriteStream(outPath);

  doc.pipe(stream);
  doc.fontSize(11).text(text, { width: 520, align: "left" });
  doc.end();

  await new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });

  return outPath;
}

export async function generateDocx(filename, text) {
  const outPath = path.join(exportsDir, filename);
  const lines = text.split("\n");

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ text: "Case Builder Report", heading: HeadingLevel.HEADING_1 }),
          ...lines.map((line) => new Paragraph(line || " "))
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outPath, buffer);
  return outPath;
}

export async function createGoogleDoc({ title, content, accessToken, refreshToken }) {
  const oauth2Client = new google.auth.OAuth2(
    config.google.clientId,
    config.google.clientSecret,
    config.google.redirectUri
  );

  oauth2Client.setCredentials({ access_token: accessToken, refresh_token: refreshToken });

  const docs = google.docs({ version: "v1", auth: oauth2Client });
  const drive = google.drive({ version: "v3", auth: oauth2Client });

  const createResp = await docs.documents.create({
    requestBody: {
      title
    }
  });

  const documentId = createResp.data.documentId;

  await docs.documents.batchUpdate({
    documentId,
    requestBody: {
      requests: [
        {
          insertText: {
            location: { index: 1 },
            text: content
          }
        }
      ]
    }
  });

  await drive.permissions.create({
    fileId: documentId,
    requestBody: {
      role: "writer",
      type: "user"
    }
  }).catch(() => null);

  return `https://docs.google.com/document/d/${documentId}/edit`;
}
