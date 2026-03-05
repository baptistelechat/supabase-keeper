import * as clack from "@clack/prompts";
import fs from "fs-extra";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CONFIG_FILENAME, Config } from "../config";
import { initCommand } from "./init";

// Mock clack prompts
vi.mock("@clack/prompts", () => ({
  __esModule: true,
  intro: vi.fn(),
  outro: vi.fn(),
  text: vi.fn(),
  confirm: vi.fn(),
  password: vi.fn(),
  log: {
    info: vi.fn(),
    message: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
  spinner: vi.fn(() => ({
    start: vi.fn(),
    stop: vi.fn(),
  })),
  isCancel: vi.fn(() => false),
  cancel: vi.fn(),
}));

const TEST_DIR = path.join(os.tmpdir(), "supabase-keeper-test-init");

describe("Init Command", () => {
  beforeEach(async () => {
    await fs.ensureDir(TEST_DIR);
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await fs.remove(TEST_DIR);
  });

  it("should create config file in specified directory", async () => {
    // Mock user input: Don't add a project
    vi.mocked(clack.confirm).mockResolvedValueOnce(false);

    // Execute command with directory argument
    await initCommand.parseAsync(["node", "test", TEST_DIR]);

    // Check if config file exists
    const configPath = path.join(TEST_DIR, CONFIG_FILENAME);
    expect(await fs.pathExists(configPath)).toBe(true);

    // Verify content
    const config: Config = await fs.readJson(configPath);
    expect(config.projects).toEqual([]);

    // Verify prompts
    expect(clack.intro).toHaveBeenCalled();
    expect(clack.outro).toHaveBeenCalled();
  });

  it("should prompt for directory if not provided", async () => {
    // Mock user input:
    // 1. Directory selection
    vi.mocked(clack.text).mockResolvedValueOnce(TEST_DIR);
    // 2. Don't add a project
    vi.mocked(clack.confirm).mockResolvedValueOnce(false);

    // Execute command without arguments
    await initCommand.parseAsync(["node", "test"]);

    const configPath = path.join(TEST_DIR, CONFIG_FILENAME);
    expect(await fs.pathExists(configPath)).toBe(true);
  });

  it("should ask to overwrite if config exists", async () => {
    // Create existing config
    const configPath = path.join(TEST_DIR, CONFIG_FILENAME);
    await fs.ensureDir(TEST_DIR);
    await fs.writeJson(configPath, { projects: [{ name: "existing" }] });

    // Mock user input:
    // 1. Overwrite? Yes
    vi.mocked(clack.confirm).mockResolvedValueOnce(true);
    // 2. Add project? No
    vi.mocked(clack.confirm).mockResolvedValueOnce(false);

    await initCommand.parseAsync(["node", "test", TEST_DIR]);

    // Verify it was overwritten (default config has empty projects)
    const config: Config = await fs.readJson(configPath);
    expect(config.projects).toEqual([]);
  });

  it("should not overwrite if user declines", async () => {
    // Create existing config
    const configPath = path.join(TEST_DIR, CONFIG_FILENAME);
    await fs.ensureDir(TEST_DIR);
    await fs.writeJson(configPath, { projects: [{ name: "existing" }] });

    // Mock user input:
    // 1. Overwrite? No
    vi.mocked(clack.confirm).mockResolvedValueOnce(false);

    await initCommand.parseAsync(["node", "test", TEST_DIR]);

    // Verify it was NOT overwritten
    const config: Config = await fs.readJson(configPath);
    expect(config.projects).toHaveLength(1);
    expect(config.projects[0]?.name).toBe("existing");
  });

  it("should add a project when requested", async () => {
    // Mock user input:
    // 1. Add project? Yes
    vi.mocked(clack.confirm).mockResolvedValueOnce(true);
    // 2. Project name
    vi.mocked(clack.text).mockResolvedValueOnce("my-new-project");
    // 3. Supabase URL
    vi.mocked(clack.text).mockResolvedValueOnce("https://example.com");
    // 4. Supabase Key (valid format)
    vi.mocked(clack.password).mockResolvedValueOnce("sb_publishable_testkey");

    await initCommand.parseAsync(["node", "test", TEST_DIR]);

    const configPath = path.join(TEST_DIR, CONFIG_FILENAME);
    const config: Config = await fs.readJson(configPath);

    expect(config.projects).toHaveLength(1);
    expect(config.projects[0]).toEqual({
      name: "my-new-project",
      supabaseProjectUrl: "https://example.com",
      supabasePublishableKey: "sb_publishable_testkey",
    });
  });
});
