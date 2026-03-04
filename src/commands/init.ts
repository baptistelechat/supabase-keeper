import {
  cancel,
  confirm,
  intro,
  isCancel,
  outro,
  spinner,
  text,
} from "@clack/prompts";
import chalk from "chalk";
import { Command } from "commander";
import fs from "fs-extra";
import path from "path";
import { CONFIG_FILENAME, DEFAULT_CONFIG, saveConfig } from "../config";

export const initCommand = new Command("init")
  .description("Initialize Supabase Keeper configuration")
  .argument("[directory]", "Directory to initialize in")
  .action(async (directory) => {
    intro(chalk.bgBlue(" supabase-keeper init "));

    let targetDir;

    if (directory) {
      targetDir = path.resolve(directory);
    } else {
      const selectedDir = await text({
        message: "Where do you want to initialize the configuration?",
        placeholder: "./supabase-keeper",
        initialValue: "./supabase-keeper",
      });

      if (isCancel(selectedDir)) {
        cancel("Operation cancelled.");
        process.exit(0);
      }
      targetDir = path.resolve(selectedDir as string);
    }

    const configPath = path.join(targetDir, CONFIG_FILENAME);

    if (await fs.pathExists(configPath)) {
      const overwrite = await confirm({
        message: `Configuration file already exists at ${configPath}. Overwrite?`,
        initialValue: false,
      });

      if (isCancel(overwrite)) {
        cancel("Operation cancelled.");
        process.exit(0);
      }

      if (!overwrite) {
        outro("Existing configuration kept. Exiting.");
        return;
      }
    }

    const shouldAddProject = await confirm({
      message: "Do you want to add a project now?",
      initialValue: true,
    });

    if (isCancel(shouldAddProject)) {
      cancel("Operation cancelled.");
      process.exit(0);
    }

    // Using JSON.parse(JSON.stringify()) to deep clone or spread if shallow
    const config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));

    if (shouldAddProject) {
      const projectName = await text({
        message: "Project name:",
        placeholder: "my-supabase-keeper",
        validate(value) {
          if (!value || value.length === 0) return "Name is required!";
        },
      });
      if (isCancel(projectName)) {
        cancel("Operation cancelled.");
        process.exit(0);
      }

      const supabaseUrl = await text({
        message: "Supabase URL (optional):",
        placeholder: "https://xyz.supabase.co",
      });
      if (isCancel(supabaseUrl)) {
        cancel("Operation cancelled.");
        process.exit(0);
      }

      const supabaseKey = await text({
        message: "Supabase Key (optional):",
        placeholder: "ey...",
      });
      if (isCancel(supabaseKey)) {
        cancel("Operation cancelled.");
        process.exit(0);
      }

      config.projects.push({
        name: projectName as string,
        path: targetDir,
        supabaseUrl: (supabaseUrl as string) || "",
        supabaseKey: (supabaseKey as string) || "",
      });
    }

    const s = spinner();
    s.start("Saving configuration...");

    // Ensure directory exists
    await fs.ensureDir(targetDir);

    await saveConfig(config, targetDir);
    s.stop("Configuration saved!");

    outro(`You're all set! Config file created at ${chalk.green(configPath)}`);
  });
