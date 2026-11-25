import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";
import { verifyPassword, signAdminToken } from "../../lib/auth.js";
import { config } from "../../config/index.js";
import { loginSchema } from "../../schemas/index.js";
import { recordAuditLog } from "../../middlewares/audit.middleware.js";

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (!user || !user.isActive) {
      await recordAuditLog({
        adminEmail: email,
        action: "LOGIN_FAILED",
        entity: "AdminUser",
        metadata: { reason: "User not found or inactive" },
      });

      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Email atau password yang Anda masukkan salah.",
        },
      });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      await recordAuditLog({
        adminId: user.id,
        adminEmail: user.email,
        action: "LOGIN_FAILED",
        entity: "AdminUser",
        metadata: { reason: "Invalid password" },
      });

      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Email atau password yang Anda masukkan salah.",
        },
      });
    }

    // Update lastLoginAt
    await prisma.adminUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = signAdminToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Set HttpOnly cookie
    res.cookie(config.COOKIE_NAME, token, {
      httpOnly: true,
      secure: config.COOKIE_SECURE,
      sameSite: config.COOKIE_SAME_SITE as "lax" | "strict" | "none",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });

    await recordAuditLog({
      adminId: user.id,
      adminEmail: user.email,
      action: "LOGIN_SUCCESS",
      entity: "AdminUser",
      entityId: user.id,
    });

    return res.status(200).json({
      success: true,
      data: {
        admin: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token, // Also returned for client flexibility
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.admin) {
      await recordAuditLog({
        adminId: req.admin.id,
        adminEmail: req.admin.email,
        action: "LOGOUT",
        entity: "AdminUser",
        entityId: req.admin.id,
      });
    }

    res.clearCookie(config.COOKIE_NAME, {
      httpOnly: true,
      secure: config.COOKIE_SECURE,
      sameSite: config.COOKIE_SAME_SITE as "lax" | "strict" | "none",
      path: "/",
    });

    return res.status(200).json({
      success: true,
      data: {
        message: "Berhasil keluar dari sesi admin.",
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Belum login." },
      });
    }

    const user = await prisma.adminUser.findUnique({
      where: { id: req.admin.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Akun admin tidak aktif." },
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
}
