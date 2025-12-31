import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load environment file based on dotenv_config_path or default to .env.local
const envFile = process.env.dotenv_config_path || ".env.local";
dotenv.config({ path: envFile });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
