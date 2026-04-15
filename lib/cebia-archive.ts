import * as fs from "fs";
import * as path from "path";

const CEBIA_ARCHIVE_DIR =
  process.env.CEBIA_ARCHIVE_DIR ||
  path.resolve(process.cwd(), "private", "cebia-archive");

async function ensureDir() {
  await fs.promises.mkdir(CEBIA_ARCHIVE_DIR, { recursive: true, mode: 0o700 });
}

export async function readArchivedCebiaEvents(): Promise<any[]> {
  try {
    const archiveFile = path.join(CEBIA_ARCHIVE_DIR, "purchases.jsonl");
    const raw = await fs.promises.readFile(archiveFile, "utf8");
    return raw
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        try {
          return JSON.parse(l);
        } catch {
          return null;
        }
      })
      .filter((v): v is any => !!v && typeof v === "object");
  } catch {
    return [];
  }
}

export async function archiveCebiaRecord(
  report: any,
  stage: "paid" | "ready",
  extras?: Record<string, unknown>,
) {
  try {
    await ensureDir();
    const line = JSON.stringify({
      ts: new Date().toISOString(),
      stage,
      reportId: report?.id || "",
      userId: report?.userId || "",
      listingId: report?.listingId || "",
      vin: report?.vin || "",
      status: report?.status || "",
      stripeSessionId: report?.stripeSessionId || "",
      stripePaymentIntentId: report?.stripePaymentIntentId || "",
      ...extras,
    });
    await fs.promises.appendFile(
      path.join(CEBIA_ARCHIVE_DIR, "purchases.jsonl"),
      `${line}\n`,
      "utf8",
    );
  } catch (e) {
    console.error("[CEBIA] Archive record error:", e);
  }
}

export async function archiveCebiaPdfIfReady(report: any) {
  try {
    if (!report?.id || !report?.vin || !report?.pdfBase64) return;
    await ensureDir();
    const safeVin = String(report.vin).replace(/[^A-Za-z0-9_-]/g, "_");
    const filename = `${safeVin}-${report.id}.pdf`;
    const filePath = path.join(CEBIA_ARCHIVE_DIR, filename);
    await fs.promises.writeFile(
      filePath,
      Buffer.from(report.pdfBase64, "base64"),
    );
    await archiveCebiaRecord(report, "ready", { archivedPdf: filename });
  } catch (e) {
    console.error("[CEBIA] Archive PDF error:", e);
  }
}
