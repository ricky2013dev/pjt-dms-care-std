import dotenv from "dotenv";
import { resolve } from "path";

// Determine which env file to load based on environment or dotenv_config_path
const envFile = process.env.dotenv_config_path || ".env.local";
dotenv.config({ path: resolve(process.cwd(), envFile) });
