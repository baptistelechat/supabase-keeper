import { intro, log } from "@clack/prompts";
import chalk from "chalk";
import Table from "cli-table3";
import { Command } from "commander";
import path from "path";
import { DEFAULT_CONFIG_DIR, loadConfig } from "../config";

export const listCommand = new Command("list")
  .description("List all monitored Supabase projects (alias: ls)")
  .aliases(["ls"])
  .argument("[directory]", "Directory where the config file is located")
  .action(async (directory) => {
    intro(chalk.bgBlue(" supabase-keeper list "));

    const targetDir = directory ? path.resolve(directory) : DEFAULT_CONFIG_DIR;
    const config = await loadConfig(targetDir);

    if (!config || config.projects.length === 0) {
      log.info(
        `No projects found. Use ${chalk.cyan("supabase-keeper add")} to add one.`,
      );
      return;
    }

    const table = new Table({
      head: [
        chalk.white.bold("Name"),
        chalk.white.bold("URL"),
        chalk.white.bold("API Key"),
        chalk.white.bold("Status"),
        chalk.white.bold("Created At"),
        chalk.white.bold("Last Ping"),
      ],
      style: { head: [], border: [] }, // Avoid default colors
    });

    config.projects.forEach((project) => {
      let statusColor = chalk.white;
      if (project.status === "active") statusColor = chalk.green;
      else if (project.status === "paused") statusColor = chalk.yellow;
      else if (project.status === "error") statusColor = chalk.red;

      table.push([
        project.name,
        project.supabaseProjectUrl,
        `...${project.supabasePublishableKey.slice(-4)}`,
        statusColor(project.status),
        project.createdAt ? project.createdAt.toLocaleString() : "Unknown",
        project.lastPing ? project.lastPing.toLocaleString() : "Never",
      ]);
    });

    console.log(table.toString());
  });
