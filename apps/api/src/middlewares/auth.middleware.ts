import { Request, Response, NextFunction } from "express";
import { verifyAdminToken, AdminTokenPayload } from "../lib/auth.js";
import { config } from "../config/index.js";
import { Role } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      admin?: AdminTokenPayload;
    }
  }
}

export function authenticateAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let token = req.cookies?.[config.COOKIE_NAME];

  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.substring(7);
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Sesi admin tidak ditemukan atau telah berakhir. Silakan login kembali.",
      },
    });
  }

  const payload = verifyAdminToken(token);
  if (!payload) {
    return res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Token autentikasi tidak valid atau sudah kedaluwarsa.",
      },
    });
  }

  req.admin = payload;
  next();
}

export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Autentikasi admin diperlukan.",
        },
      });
    }

    if (!allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Anda tidak memiliki hak akses untuk tindakan ini.",
        },
      });
    }

    next();
  };
}
