import { cancel, confirm, intro, isCancel, outro } from "@clack/prompts";
import chalk from "chalk";
import { Command } from "commander";
import path from "path";
import {
  DEFAULT_CONFIG_DIR,
  ensureConfig,
  ensureProject,
  saveConfig,
} from "../config";

export const removeCommand = new Command("remove")
  .description(
    "Remove a Supabase project from the configuration (aliases: rm, delete)",
  )
  .aliases(["rm", "delete"])
  .argument("<project-name>", "Name of the project to remove")
  .argument("[directory]", "Directory where the config file is located")
  .option("-f, --force", "Force deletion without confirmation")
  .action(async (projectName, directory, options) => {
    intro(chalk.bgRed(" supabase-keeper remove "));

    const targetDir = directory ? path.resolve(directory) : DEFAULT_CONFIG_DIR;
    const config = await ensureConfig(targetDir);

    const { index: projectIndex } = ensureProject(config, projectName);

    if (!options.force) {
      const shouldDelete = await confirm({
        message: `Are you sure you want to remove project ${chalk.red(
          projectName,
        )}?`,
      });

      if (isCancel(shouldDelete)) {
        cancel("Operation cancelled.");
        return;
      }

      if (!shouldDelete) {
        outro("Operation cancelled.");
        return;
      }
    }

    config.projects.splice(projectIndex, 1);
    await saveConfig(config, targetDir);

    outro(`Project ${chalk.green(projectName)} removed successfully.`);
  });
