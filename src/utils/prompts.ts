import {
  cancel,
  isCancel,
  password,
  select,
  spinner,
  text,
} from "@clack/prompts";
import chalk from "chalk";
import { z } from "zod";
import type { Config } from "../config";
import { validateSupabaseConnection } from "./validation";

export type Project = Config["projects"][number];

export async function promptForProjectDetails(
  existingProjects: Config["projects"] = [],
): Promise<Project | null> {
  const projectName = await text({
    message: "Project name:",
    placeholder: "my-project",
    validate(value) {
      if (!value || value.length === 0) return "Name is required!";
      if (existingProjects.some((p) => p.name === value)) {
        return "Project name already exists.";
      }
    },
  });

  if (isCancel(projectName)) {
    cancel("Operation cancelled.");
    return null;
  }

  let supabaseProjectUrl: string | symbol = "";
  let supabasePublishableKey: string | symbol = "";

  // eslint-disable-next-line no-constant-condition
  while (true) {
    supabaseProjectUrl = await text({
      message: "Supabase URL:",
      placeholder: "https://xyz.supabase.co",
      validate(value) {
        if (!value) return "URL is required";
        const result = z.string().trim().url().safeParse(value);
        if (!result.success) return "Invalid URL format";
        // Check for duplicate URL
        if (existingProjects.some((p) => p.supabaseProjectUrl === value)) {
          return "Project URL already exists.";
        }
      },
    });

    if (isCancel(supabaseProjectUrl)) {
      cancel("Operation cancelled.");
      return null;
    }

    supabasePublishableKey = await password({
      message: "Supabase Publishable Key:",
      mask: "•",
      validate(value) {
        if (!value) return "Key is required";

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
      return null;
    }

    const s = spinner();
    s.start("Validating connection...");

    const validation = await validateSupabaseConnection(
      supabaseProjectUrl as string,
      supabasePublishableKey as string,
    );

    if (validation.isValid) {
      s.stop(validation.message || "Connection verified!");
      break;
    } else {
      s.stop(chalk.red(`Validation failed: ${validation.message}`));
      
      const action = await select({
        message: "Connection validation failed. What do you want to do?",
        options: [
          { value: "retry", label: "Retry entry" },
          { value: "force", label: "Force add (skip validation)" },
          { value: "cancel", label: "Cancel" },
        ],
      });

      if (isCancel(action) || action === "cancel") {
        cancel("Operation cancelled.");
        return null;
      }

      if (action === "force") {
        break;
      }
      
      // If retry, loop continues
    }
  }

  return {
    name: projectName as string,
    supabaseProjectUrl: (supabaseProjectUrl as string) || "",
    supabasePublishableKey: (supabasePublishableKey as string) || "",
    createdAt: new Date(),
  };
}
