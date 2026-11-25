import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { config } from "../config/index.js";

// Ensure storage directory exists
if (!fs.existsSync(config.storagePath)) {
  fs.mkdirSync(config.storagePath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.storagePath);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const randomName = crypto.randomBytes(16).toString("hex");
    cb(null, `${Date.now()}-${randomName}${ext}`);
  },
});

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Hanya file gambar (JPG, PNG, WebP) yang diizinkan."));
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: config.UPLOAD_MAX_SIZE_MB * 1024 * 1024,
  },
  fileFilter,
});

export function deleteFile(filePathOrUrl: string): void {
  try {
    const fileName = path.basename(filePathOrUrl);
    const targetPath = path.join(config.storagePath, fileName);
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
    }
  } catch (err) {
    console.error("Failed to delete file:", err);
  }
}
