import { log } from "@clack/prompts";
import chalk from "chalk";
import { execSync } from "child_process";

export function isPM2Installed(): boolean {
  try {
    // Attempt to execute `pm2 -v`
    // We must NOT use stdio: "ignore" if we want to debug, but for checking we usually ignore output
    // However, if it fails, execSync throws.
    // If command is not found, it throws.
    execSync("pm2 -v", { stdio: "pipe" }); // Changed to pipe to avoid noise but still throw if not found
    return true;
  } catch (error) {
    // On Windows, 'pm2' might be a batch file (pm2.cmd), node's execSync usually handles this if in PATH.
    // If it fails, we can try checking if it returns ENOENT or 'not recognized'
    return false;
  }
}

export function startWithPM2(
  scriptPath: string,
  name: string = "supabase-keeper",
  args: string[] = [],
): boolean {
  try {
    // Check if process is already running
    try {
      execSync(`pm2 describe ${name}`, { stdio: "ignore" });
      log.info(
        `Process ${chalk.yellow(name)} is already managed by PM2. Restarting...`,
      );
      execSync(`pm2 restart ${name}`, { stdio: "inherit" });
      return true;
    } catch (e) {
      // Process not found, start new
    }

    const argsStr = args.length > 0 ? ` -- ${args.join(" ")}` : "";
    
    // We also need to handle interpreter for .ts files if running locally
    // But let's assume built .js for now

    execSync(`pm2 start "${scriptPath}" --name ${name}${argsStr}`, {
      stdio: "inherit",
    });
    log.success(`Process ${chalk.green(name)} started with PM2.`);
    return true;
  } catch (error) {
    log.error(`Failed to start process with PM2: ${error}`);
    return false;
  }
}

export function savePM2List(): boolean {
  try {
    execSync("pm2 save", { stdio: "inherit" });
    log.success("PM2 process list saved.");
    return true;
  } catch (error) {
    log.error(`Failed to save PM2 process list: ${error}`);
    return false;
  }
}
