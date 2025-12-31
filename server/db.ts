import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { drizzle as drizzleNode } from "drizzle-orm/node-postgres";
import { Pool as NeonPool, neonConfig } from "@neondatabase/serverless";
import { Pool as PgPool } from "pg";
import * as schema from "@shared/schema";
import ws from "ws";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

// Determine if we're using Neon (cloud) or local PostgreSQL
const isNeonDatabase = process.env.DATABASE_URL.includes('neon.tech');

let db;

if (isNeonDatabase) {
  // Use Neon serverless driver for cloud database
  neonConfig.webSocketConstructor = ws;
  const pool = new NeonPool({ connectionString: process.env.DATABASE_URL });
  db = drizzleNeon(pool, { schema });
} else {
  // Use standard node-postgres driver for local development
  const pool = new PgPool({ connectionString: process.env.DATABASE_URL });
  db = drizzleNode(pool, { schema });
}

export { db };
