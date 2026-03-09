import { intro, log, outro } from "@clack/prompts";
import chalk from "chalk";
import { Command } from "commander";
import fs from "fs";
import cron from "node-cron";
import path from "path";
import { fileURLToPath } from "url";
import { DEFAULT_CONFIG_DIR, ensureConfig } from "../config";
import { isPM2Installed, savePM2List, startWithPM2 } from "../utils/pm2";
import { logCommand } from "../utils/utils";

export const pingCommand = new Command("ping")
  .description("Ping all active projects")
  .argument("[directory]", "Directory where the config file is located")
  .option("--all", "Ping all projects regardless of status (not implemented)")
  .option("--daemon", "Run in background with PM2 (daily ping)")
  // Option cachée pour le mode boucle interne, non visible dans l'aide mais utilisée par le démon
  .addOption(
    new Command("").createOption("--loop", "Internal loop mode").hideHelp(),
  )
  .action(async (directory, options) => {
    // Determine target directory
    const targetDir = directory ? path.resolve(directory) : DEFAULT_CONFIG_DIR;

    // Function to execute the ping logic
    const runPing = async () => {
      // Re-read config each time to get latest projects status
      const config = await ensureConfig(targetDir);
      const activeProjects = config.projects.filter(
        (p) => p.status === "active",
      );

      if (activeProjects.length === 0) {
        log.warn(
          chalk.yellow(
            `No active projects to ping. Run ${logCommand(
              "supabase-keeper active",
            )} to activate a project.`,
          ),
        );
        return;
      }

      log.info(
        `[${new Date().toISOString()}] Pinging ${
          activeProjects.length
        } active projects...`,
      );

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
      log.info(`[${new Date().toISOString()}] Ping cycle complete.`);
    };

    // --- Mode Loop (Worker) ---
    // Ce mode est exécuté par le processus PM2
    if (options.loop) {
      // En mode loop, on évite les intros/outros verbeux pour les logs
      log.info(
        chalk.green("Starting Internal Loop Mode with Cron (09:00 daily)..."),
      );

      // Exécution immédiate au démarrage pour vérifier que tout fonctionne
      await runPing();

      // Planification Cron : Tous les jours à 09:00
      // 0 9 * * *
      cron.schedule("0 9 * * *", async () => {
        // cron.schedule("*/30 * * * * *", async () => {
        try {
          log.info(chalk.blue("Running scheduled daily ping..."));
          await runPing();
        } catch (err) {
          log.error(`Daemon error: ${err}`);
        }
      });

      // Maintient le processus en vie (node-cron ne bloque pas l'event loop par défaut,
      // mais tant qu'il y a des timers actifs ou un process qui tourne, ça devrait aller.
      // Cependant, dans un script CLI, il faut parfois forcer l'attente.)
      // Une simple astuce est d'avoir un intervalle "heartbeat" très long ou juste laisser le cron.
      // Node ne quitte pas tant qu'il y a des callbacks prévus.

      log.info(
        chalk.gray("Scheduler is running. Waiting for next execution..."),
      );

      return;
    }

    // --- Mode Daemon (Launcher PM2) ---
    // Ce mode est exécuté par l'utilisateur pour lancer le démon
    if (options.daemon) {
      intro(chalk.bgBlue(" supabase-keeper ping --daemon "));

      if (!isPM2Installed()) {
        log.error(chalk.red("PM2 is not installed or not found in PATH."));
        log.error(
          "Please install it globally using one of the following commands:",
        );
        log.error("  • npm install -g pm2");
        log.error("  • pnpm add -g pm2");
        log.error("  • yarn global add pm2");
        log.error("  • bun add -g pm2");
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
        path.dirname(fileURLToPath(import.meta.url)),
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

      // Start with PM2 running `supabase-keeper ping --loop`
      // This ensures the background process stays alive and loops internally
      const success = startWithPM2(scriptPath, "supabase-keeper", [
        "ping",
        "--loop",
      ]);

      if (success) {
        savePM2List();
        log.info(
          chalk.green(
            "PM2 configuration updated! Background monitoring started.",
          ),
        );
        log.info(
          `Use ${chalk.blue("pm2 logs supabase-keeper")} to check logs and 'pm2 stop supabase-keeper' to stop.`,
        );
      } else {
        log.error(chalk.red("Failed to configure PM2."));
      }

      outro(chalk.green("Done!"));
      return;
    }

    // --- Mode Standard (One-shot) ---
    intro(chalk.bgBlue(" supabase-keeper ping "));
    log.info("Starting ping check...");
    await runPing();
    outro(chalk.green("Ping complete!"));
  });
