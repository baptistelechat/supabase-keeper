import { intro, outro } from "@clack/prompts";
import chalk from "chalk";
import { Command } from "commander";
import path from "path";
import { DEFAULT_CONFIG_DIR, ensureConfig, saveConfig } from "../config";
import { promptForProjectDetails } from "../utils/prompts";

export const addCommand = new Command("add")
  .description("Add a new Supabase project")
  .argument("[directory]", "Directory where the config file is located")
  .action(async (directory) => {
    intro(chalk.bgBlue(" supabase-keeper add "));

    const targetDir = directory ? path.resolve(directory) : DEFAULT_CONFIG_DIR;
    const config = await ensureConfig(targetDir);

    const projectDetails = await promptForProjectDetails(config.projects);

    if (!projectDetails) {
      process.exit(0); // Cancelled
      return;
    }

    config.projects.push(projectDetails);

    await saveConfig(config, targetDir);

    outro(`Project ${chalk.green(projectDetails.name)} added successfully!`);
  });
