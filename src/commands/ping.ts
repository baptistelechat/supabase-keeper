import { intro, log, outro } from "@clack/prompts";
import chalk from "chalk";
import { Command } from "commander";
import fs from "fs";
import path from "path";
import { DEFAULT_CONFIG_DIR, ensureConfig } from "../config";
import { isPM2Installed, savePM2List, startWithPM2 } from "../utils/pm2";

export const pingCommand = new Command("ping")
  .description("Ping all active projects")
  .argument("[directory]", "Directory where the config file is located")
  .option("--all", "Ping all projects regardless of status (not implemented)")
  .option("--daemon", "Run in background with PM2")
  .action(async (directory, options) => {
    intro(chalk.bgBlue(" supabase-keeper ping"));
    // If --daemon is specified, handle background process setup
    if (options.daemon) {
      if (!isPM2Installed()) {
        log.error(chalk.red("PM2 is not installed or not found in PATH."));
        log.error("Please install it globally: npm install -g pm2");
        process.exit(1);
      }

      log.info(chalk.green("PM2 is installed."));

      let scriptPath = process.argv[1];

      if (!scriptPath) {
        log.error("Could not determine script path.");
        process.exit(1);
      }

      // Try to find dist/index.js for production stability
      const pkgRoot = path.resolve(
        path.dirname(new URL(import.meta.url).pathname),
        "../../",
      );
      const distIndex = path.join(pkgRoot, "dist", "index.js");

      if (fs.existsSync(distIndex)) {
        scriptPath = distIndex;
      } else {
        if (scriptPath.endsWith(".ts")) {
          log.warn(
            "Running .ts file with PM2 might require an interpreter configuration.",
          );
          log.warn(
            "It is recommended to build the project first: npm run build",
          );
        }
      }

      // Start with PM2 running `supabase-keeper ping` (without --daemon to avoid loop)
      const success = startWithPM2(scriptPath, "supabase-keeper", ["ping"]);

      if (success) {
        savePM2List();
        log.info(
          chalk.green(
            "PM2 configuration updated! Background monitoring started.",
          ),
        );
      } else {
        log.error(chalk.red("Failed to configure PM2."));
      }
      return;
    }

    // Normal ping execution
    log.info("Starting ping check...");

    const targetDir = directory ? path.resolve(directory) : DEFAULT_CONFIG_DIR;
    const config = await ensureConfig(targetDir);

    const activeProjects = config.projects.filter((p) => p.status === "active");

    if (activeProjects.length === 0) {
      log.warn(
        chalk.yellow(
          `No active projects to ping. Run ${chalk.cyan(
            "supabase-keeper active",
          )} to activate a project.`,
        ),
      );
      return;
    }

    log.info(`Pinging ${activeProjects.length} active projects...`);

    for (const project of activeProjects) {
      try {
        // TODO: Implement actual ping logic (Epic 3)
        // For now, just log
        log.info(
          `Pinging ${chalk.blue(project.name)} ${chalk.gray(
            `(${project.supabaseProjectUrl})`,
          )}`,
        );

        // Simulate ping
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        log.error(`Failed to ping ${chalk.red(project.name)}: ${error}`);
      }
    }

    outro(chalk.green("Ping complete!"));
  });
