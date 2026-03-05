import {
  cancel,
  confirm,
  intro,
  isCancel,
  log,
  outro,
  password,
  spinner,
  text,
} from "@clack/prompts";
import chalk from "chalk";
import { Command } from "commander";
import fs from "fs-extra";
import path from "path";
import z from "zod";
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
        message: `Configuration file already exists at ${chalk.yellow(configPath)}. Overwrite?`,
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
      log.info(
        chalk.gray(
          `💡 Need your project details (URL & Publishable Key)?\n   Go to: ${chalk.cyan.underline(
            "https://supabase.com/dashboard/project/_/settings/api?showConnect=true&connectTab=api-keys",
          )}`,
        ),
      );

      const projectName = await text({
        message: "Project name:",
        placeholder: "my-first-project",
        validate(value) {
          if (!value || value.length === 0) return "Name is required!";
        },
      });
      if (isCancel(projectName)) {
        cancel("Operation cancelled.");
        process.exit(0);
      }

      const supabaseProjectUrl = await text({
        message: `Supabase URL ${chalk.gray("(optional)")}:`,
        placeholder: "https://xyz.supabase.co",
        validate(value) {
          if (!value) return; // Optional
          const result = z.string().url().safeParse(value);
          if (!result.success) return "Invalid URL format";
        },
      });
      if (isCancel(supabaseProjectUrl)) {
        cancel("Operation cancelled.");
        process.exit(0);
      }

      const supabasePublishableKey = await password({
        message: `Supabase Publishable Key ${chalk.gray("(optional)")}:`,
        mask: "•",
        validate(value) {
          if (!value) return; // Optional

          // Check for new format (sbp_... or sb_publishable_...)
          if (value.startsWith("sbp_") || value.startsWith("sb_publishable_")) {
            return; // Valid new format
          }

          // Check for legacy JWT format (3 parts separated by dots)
          const parts = value.split(".");
          if (parts.length === 3) {
            return; // Valid legacy format
          }

          return "Invalid key format. Expected 'sbp_'/'sb_publishable_' prefix or legacy JWT format.";
        },
      });
      if (isCancel(supabasePublishableKey)) {
        cancel("Operation cancelled.");
        process.exit(0);
      }

      config.projects.push({
        name: projectName as string,
        supabaseProjectUrl: (supabaseProjectUrl as string) || "",
        supabasePublishableKey: (supabasePublishableKey as string) || "",
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
