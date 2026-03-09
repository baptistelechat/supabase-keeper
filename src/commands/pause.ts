import { intro, log, outro } from "@clack/prompts";
import chalk from "chalk";
import { Command } from "commander";
import path from "path";
import {
  DEFAULT_CONFIG_DIR,
  ensureConfig,
  ensureProject,
  saveConfig,
} from "../config";

export const pauseCommand = new Command("pause")
  .description(
    "Pause monitoring for a Supabase project (aliases: stop, suspend)",
  )
  .aliases(["stop", "suspend"])
  .argument("<project-name>", "Name of the project to pause")
  .argument("[directory]", "Directory where the config file is located")
  .action(async (projectName, directory) => {
    intro(chalk.bgBlue(" supabase-keeper pause "));

    const targetDir = directory ? path.resolve(directory) : DEFAULT_CONFIG_DIR;

    const config = await ensureConfig(targetDir);

    const { project, index: projectIndex } = ensureProject(config, projectName);

    if (project.status === "paused") {
      log.info(`Project ${chalk.cyan(projectName)} is already paused.`);
      return;
    }

    project.status = "paused";
    config.projects[projectIndex] = project;

    await saveConfig(config, targetDir);

    outro(`Project ${chalk.green(projectName)} has been paused.`);
  });
