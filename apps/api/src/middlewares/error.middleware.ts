import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { logger } from "../lib/logger.js";

export class ApiError extends Error {
  statusCode: number;
  code: string;
  details?: any[];

  constructor(statusCode: number, code: string, message: string, details?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error(err);

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));

    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Periksa kembali data yang dikirim.",
        details,
      },
    });
  }

  // Handle Custom ApiError
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details || [],
      },
    });
  }

  // Handle Multer upload size error
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      error: {
        code: "FILE_TOO_LARGE",
        message: "Ukuran file melebihi batas maksimum yang diizinkan.",
      },
    });
  }

  // Default internal server error
  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Terjadi kesalahan sistem internal. Silakan coba beberapa saat lagi.",
    },
  });
}
