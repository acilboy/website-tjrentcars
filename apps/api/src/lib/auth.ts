import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { Role } from "@prisma/client";

export interface AdminTokenPayload {
  id: string;
  email: string;
  role: Role;
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signAdminToken(payload: AdminTokenPayload): string {
  return jwt.sign(payload, config.ACCESS_TOKEN_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    return jwt.verify(token, config.ACCESS_TOKEN_SECRET) as AdminTokenPayload;
  } catch (error) {
    return null;
  }
}
