import fs from "fs-extra";
import path from "path";
import { DEFAULT_CONFIG_DIR } from "../config";

const LOG_FILE = "supabase-keeper.log";

export async function logPing(
  projectName: string,
  success: boolean,
  details: string,
  configDir: string = DEFAULT_CONFIG_DIR,
): Promise<void> {
  const logPath = path.join(configDir, LOG_FILE);
  const timestamp = new Date().toISOString();
  const status = success ? "SUCCESS" : "FAILURE";
  const logEntry = `[${timestamp}] [${status}] [${projectName}] ${details}\n`;

  try {
    await fs.ensureDir(configDir);
    await fs.appendFile(logPath, logEntry);
  } catch (error) {
    console.error(`Failed to write to log file: ${error}`);
  }
}
