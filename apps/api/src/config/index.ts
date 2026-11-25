import dotenv from "dotenv";
import { z } from "zod";
import path from "path";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("4000").transform((val) => parseInt(val, 10)),
  API_BASE_PATH: z.string().default("/api/v1"),
  FRONTEND_URL: z.string().default("http://localhost:3000"),
  PUBLIC_SITE_URL: z.string().default("http://localhost:3000"),
  DATABASE_URL: z.string().default("postgresql://postgres:postgres@localhost:5432/tj_rentcar?schema=public"),
  SESSION_SECRET: z.string().default("dev_super_secret_session_key_32_characters_minimum_random!"),
  ACCESS_TOKEN_SECRET: z.string().default("dev_super_secret_access_key_32_characters_minimum_random!"),
  REFRESH_TOKEN_SECRET: z.string().default("dev_super_secret_refresh_key_32_characters_minimum_random!"),
  COOKIE_NAME: z.string().default("tj_rentcar_admin_session"),
  COOKIE_SECURE: z.string().default("false").transform((val) => val === "true"),
  COOKIE_SAME_SITE: z.enum(["lax", "strict", "none"]).default("lax"),
  STORAGE_PROVIDER: z.enum(["local", "s3", "cloudinary"]).default("local"),
  STORAGE_DIR: z.string().default("uploads"),
  UPLOAD_MAX_SIZE_MB: z.string().default("5").transform((val) => parseInt(val, 10)),
  DEFAULT_TIMEZONE: z.string().default("Asia/Jakarta"),
  DEFAULT_CURRENCY: z.string().default("IDR"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.format());
  process.exit(1);
}

export const config = {
  ...parsed.data,
  isProd: parsed.data.NODE_ENV === "production",
  isDev: parsed.data.NODE_ENV === "development",
  isTest: parsed.data.NODE_ENV === "test",
  storagePath: path.resolve(process.cwd(), parsed.data.STORAGE_DIR),
};
