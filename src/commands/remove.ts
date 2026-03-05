import { cancel, confirm, intro, isCancel, log, outro } from "@clack/prompts";
import chalk from "chalk";
import { Command } from "commander";
import path from "path";
import { loadConfig, saveConfig } from "../config";

export const removeCommand = new Command("remove")
  .description("Remove a Supabase project from the configuration (aliases: rm, delete)")
  .aliases(["rm","delete"])
  .argument("<project-name>", "Name of the project to remove")
  .argument("[directory]", "Directory where the config file is located")
  .option("-f, --force", "Force deletion without confirmation")
  .action(async (projectName, directory, options) => {
    intro(chalk.bgRed(" supabase-keeper remove "));

    const targetDir = directory ? path.resolve(directory) : process.cwd();
    const config = await loadConfig(targetDir);

    if (!config) {
      log.error(
        `Configuration not found in ${chalk.yellow(targetDir)}.\nPlease run ${chalk.cyan(
          "supabase-keeper init",
        )} first or go to the project directory.`,
      );
      process.exit(1);
      return;
    }

    const projectIndex = config.projects.findIndex(
      (p) => p.name === projectName,
    );

    if (projectIndex === -1) {
      log.error(
        `Project ${chalk.red(projectName)} not found. use ${chalk.cyan(
          "supabase-keeper list",
        )} to see available projects.`,
      );
      process.exit(1);
      return;
    }

    if (!options.force) {
      const shouldDelete = await confirm({
        message: `Are you sure you want to remove project ${chalk.red(
          projectName,
        )}?`,
      });

      if (isCancel(shouldDelete)) {
        cancel("Operation cancelled.");
        process.exit(0);
        return;
      }

      if (!shouldDelete) {
        outro("Operation cancelled.");
        process.exit(0);
        return;
      }
    }

    config.projects.splice(projectIndex, 1);
    await saveConfig(config, targetDir);

    outro(`Project ${chalk.green(projectName)} removed successfully!`);
  });
