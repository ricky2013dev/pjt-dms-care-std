import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Determine which env file to load based on environment or dotenv_config_path
const envFile = process.env.dotenv_config_path || ".env.local";
dotenv.config({ path: resolve(__dirname, "..", envFile) });
