import fs from "fs-extra";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CONFIG_FILENAME, Config, loadConfig, saveConfig } from "./config";

const TEST_DIR = path.join(os.tmpdir(), "supabase-keeper-test-config");

describe("Config", () => {
  beforeEach(async () => {
    await fs.ensureDir(TEST_DIR);
  });

  afterEach(async () => {
    await fs.remove(TEST_DIR);
  });

  it("should save and load config", async () => {
    const now = new Date();
    const config: Config = {
      projects: [
        {
          name: "test-project",
          supabaseProjectUrl: "https://example.com",
          supabasePublishableKey: "sbp_key",
          createdAt: now,
          status: "active",
          lastPing: undefined,
        },
      ],
    };

    await saveConfig(config, TEST_DIR);
    const loaded = await loadConfig(TEST_DIR);

    // Dates from JSON will be parsed back to Date objects by our schema transformation
    // But ms precision might be lost or ISO string conversion might happen
    // Let's compare timestamps or use toISOString for comparison if needed
    // Actually, saveConfig writes JSON. JSON.stringify(Date) = ISO string.
    // loadConfig reads JSON and transforms ISO string to Date.
    // So loaded should be equal to config.
    expect(loaded).toEqual(config);
  });

  it("should return null if config does not exist", async () => {
    const loaded = await loadConfig(TEST_DIR);
    expect(loaded).toBeNull();
  });

  it("should handle invalid config file", async () => {
    const filePath = path.join(TEST_DIR, CONFIG_FILENAME);
    await fs.writeFile(filePath, "invalid json");

    // Silence console.error for test
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const loaded = await loadConfig(TEST_DIR);
    expect(loaded).toBeNull();

    consoleSpy.mockRestore();
  });
});
