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
import { logCommand } from "../utils/utils";

export const activeCommand = new Command("active")
  .description(
    "Active monitoring for a Supabase project (aliases: resume, start, unpause)",
  )
  .aliases(["resume", "start", "unpause"])
  .argument("<project-name>", "Name of the project to resume")
  .argument("[directory]", "Directory where the config file is located")
  .action(async (projectName, directory) => {
    intro(chalk.bgBlue(" supabase-keeper active "));

    const targetDir = directory ? path.resolve(directory) : DEFAULT_CONFIG_DIR;

    const config = await ensureConfig(targetDir);

    const { project, index: projectIndex } = ensureProject(config, projectName);

    if (project.status === "active") {
      log.info(
        `Project ${logCommand(projectName)} is already active.`,
      );
      return;
    }

    project.status = "active";
    config.projects[projectIndex] = project;

    await saveConfig(config, targetDir);

    log.success(`Project ${chalk.green(projectName)} has been resumed.`);
  });
