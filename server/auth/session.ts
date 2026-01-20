import session from "express-session";
import pgSession from "connect-pg-simple";
import { Pool as NeonPool } from "@neondatabase/serverless";
import { Pool as PgPool } from "pg";

const PgStore = pgSession(session);

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

// Determine if we're using Neon (cloud) or local PostgreSQL
const isNeonDatabase = process.env.DATABASE_URL.includes('neon.tech');

// Use appropriate pool based on database type
const pool = isNeonDatabase
  ? new NeonPool({ connectionString: process.env.DATABASE_URL })
  : new PgPool({ connectionString: process.env.DATABASE_URL });

export const sessionMiddleware = session({
  store: new PgStore({
    pool,
    tableName: "session", // Will auto-create this table
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  },
});
