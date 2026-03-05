import fs from "fs-extra";
import path from "path";
import { z } from "zod";

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
  directory: string = process.cwd(),
): Promise<string> {
  const filePath = path.join(directory, CONFIG_FILENAME);
  await fs.writeJson(filePath, config, { spaces: 2 });
  return filePath;
}

export async function loadConfig(
  directory: string = process.cwd(),
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
