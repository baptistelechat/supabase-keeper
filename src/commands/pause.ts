import { intro, log, outro } from "@clack/prompts";
import chalk from "chalk";
import { Command } from "commander";
import path from "path";
import { loadConfig, saveConfig } from "../config";

export const pauseCommand = new Command("pause")
  .description("Pause monitoring for a Supabase project (aliases: stop, suspend)")
  .aliases(["stop", "suspend"])
  .argument("<project-name>", "Name of the project to pause")
  .argument("[directory]", "Directory where the config file is located")
  .action(async (projectName, directory) => {
    intro(chalk.bgBlue(" supabase-keeper pause "));

    const targetDir = directory ? path.resolve(directory) : process.cwd();

    const config = await loadConfig(targetDir);

    if (!config) {
      log.error(
        `Configuration file not found in ${targetDir}. Run 'supabase-keeper init' first.`,
      );
      process.exit(1);
    }

    const projectIndex = config.projects.findIndex(
      (p) => p.name === projectName,
    );

    if (projectIndex === -1) {
      log.error(`Project ${chalk.red(projectName)} not found.`);
      process.exit(1);
    }

    const project = config.projects[projectIndex];

    if (!project) {
      log.error(`Project ${chalk.red(projectName)} could not be retrieved.`);
      process.exit(1);
    }

    if (project.status === "paused") {
      log.info(`Project ${chalk.yellow(projectName)} is already paused.`);
      outro(chalk.yellow("No changes made."));
      return;
    }

    project.status = "paused";
    config.projects[projectIndex] = project;

    await saveConfig(config, targetDir);

    log.success(`Project ${chalk.green(projectName)} has been paused.`);
    outro(chalk.green("Done!"));
  });
