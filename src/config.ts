import { log } from "@clack/prompts";
import chalk from "chalk";
import fs from "fs-extra";
import os from "os";
import path from "path";
import { z } from "zod";

export const DEFAULT_CONFIG_DIR = path.join(os.homedir(), ".supabase-keeper");

export async function ensureConfig(
  targetDir: string = DEFAULT_CONFIG_DIR,
): Promise<Config> {
  const config = await loadConfig(targetDir);

  if (!config) {
    log.error(
      `Configuration file not found in ${chalk.red(targetDir)}. Run ${chalk.cyan(
        "supabase-keeper init",
      )} first.`,
    );
    process.exit(1);
  }

  return config;
}

export function ensureProject(
  config: Config,
  projectName: string,
): { project: Config["projects"][0]; index: number } {
  const index = config.projects.findIndex((p) => p.name === projectName);
  const project = config.projects[index];

  if (index === -1 || !project) {
    log.error(
      `Project ${chalk.red(projectName)} not found. Use ${chalk.cyan(
        "supabase-keeper list",
      )} to see available projects.`,
    );
    process.exit(1);
  }

  return { project, index };
}

export const ConfigSchema = z.object({
  projects: z
    .array(
      z.object({
        name: z.string(),
        supabaseProjectUrl: z.string(),
        supabasePublishableKey: z.string(),
        createdAt: z
          .string()
          .datetime()
          .optional()
          .transform((val) => (val ? new Date(val) : undefined)),
        status: z.enum(["active", "paused", "error"]).default("active"),
        lastPing: z
          .string()
          .datetime()
          .optional()
          .transform((val) => (val ? new Date(val) : undefined)),
      }),
    )
    .default([]),
});

export type Config = z.infer<typeof ConfigSchema>;

export const DEFAULT_CONFIG: Config = {
  projects: [],
};

export const CONFIG_FILENAME = "supabase-keeper.config.json";

export async function saveConfig(
  config: Config,
  directory: string = DEFAULT_CONFIG_DIR,
): Promise<string> {
  const filePath = path.join(directory, CONFIG_FILENAME);
  await fs.writeJson(filePath, config, { spaces: 2 });
  return filePath;
}

export async function loadConfig(
  directory: string = DEFAULT_CONFIG_DIR,
): Promise<Config | null> {
  const filePath = path.join(directory, CONFIG_FILENAME);
  if (await fs.pathExists(filePath)) {
    try {
      const json = await fs.readJson(filePath);
      return ConfigSchema.parse(json);
    } catch (error) {
      console.error("Error parsing config file:", error);
      return null;
    }
  }
  return null;
}
