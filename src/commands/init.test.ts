import * as clack from "@clack/prompts";
import fs from "fs-extra";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CONFIG_FILENAME, Config } from "../config";
import { initCommand } from "./init";

// Mock config to use MOCK_DEFAULT_DIR as default
vi.mock("../config", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../config")>();
  const path = await import("path");
  const os = await import("os");
  const MOCK_DIR = path.join(os.tmpdir(), "supabase-keeper-test-init");
  return {
    ...actual,
    DEFAULT_CONFIG_DIR: MOCK_DIR,
  };
});

// Define path for mocks (matching the one inside vi.mock)
const MOCK_DEFAULT_DIR = path.join(os.tmpdir(), "supabase-keeper-test-init");
const CONFIG_PATH = path.join(MOCK_DEFAULT_DIR, CONFIG_FILENAME);

// Mock validation
vi.mock("../utils/validation", () => ({
  validateSupabaseConnection: vi.fn().mockResolvedValue({ isValid: true }),
}));

// Mock clack prompts
vi.mock("@clack/prompts", () => ({
  intro: vi.fn(),
  outro: vi.fn(),
  text: vi.fn(),
  confirm: vi.fn(),
  isCancel: vi.fn(() => false),
  cancel: vi.fn(),
  log: {
    info: vi.fn(),
    message: vi.fn(),
  },
  password: vi.fn(),
  spinner: () => ({ start: vi.fn(), stop: vi.fn() }),
}));

describe("Init Command", () => {
  let cwdSpy: any;
  let exitSpy: any;

  beforeEach(async () => {
    await fs.ensureDir(MOCK_DEFAULT_DIR);
    cwdSpy = vi.spyOn(process, "cwd").mockReturnValue(MOCK_DEFAULT_DIR);
    exitSpy = vi.spyOn(process, "exit").mockImplementation((() => {}) as any);
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await fs.remove(MOCK_DEFAULT_DIR);
    vi.restoreAllMocks();
  });

  it("should create config file in default directory if no argument provided", async () => {
    // Mock inputs
    vi.mocked(clack.confirm).mockResolvedValueOnce(false); // Add project? No

    await initCommand.parseAsync(["node", "test"]);

    const configExists = await fs.pathExists(CONFIG_PATH);
    expect(configExists).toBe(true);
    const config = await fs.readJson(CONFIG_PATH);
    expect(config).toEqual({ projects: [] });
    expect(clack.outro).toHaveBeenCalled();
  });

  it("should create config file in specified directory argument", async () => {
    const CUSTOM_DIR = path.join(MOCK_DEFAULT_DIR, "custom");
    const CUSTOM_CONFIG_PATH = path.join(CUSTOM_DIR, CONFIG_FILENAME);
    
    // Mock inputs
    vi.mocked(clack.confirm).mockResolvedValueOnce(false); // Add project? No

    await initCommand.parseAsync(["node", "test", CUSTOM_DIR]);

    const configExists = await fs.pathExists(CUSTOM_CONFIG_PATH);
    expect(configExists).toBe(true);
  });

  it("should ask to overwrite if config exists", async () => {
    await fs.writeJson(CONFIG_PATH, { projects: [] });

    // Mock inputs
    vi.mocked(clack.confirm).mockResolvedValueOnce(true); // Overwrite? Yes
    vi.mocked(clack.confirm).mockResolvedValueOnce(false); // Add project? No

    await initCommand.parseAsync(["node", "test"]);

    expect(clack.confirm).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("already exists"),
      }),
    );
  });

  it("should not overwrite if user declines", async () => {
    await fs.writeJson(CONFIG_PATH, { projects: [{ name: "existing" }] });

    // Mock inputs
    vi.mocked(clack.confirm).mockResolvedValueOnce(false); // Overwrite? No

    await initCommand.parseAsync(["node", "test"]);

    const config = await fs.readJson(CONFIG_PATH);
    expect(config.projects).toHaveLength(1);
    expect(config.projects[0]?.name).toBe("existing");
  });

  it("should add a project when requested", async () => {
    // Mock inputs
    vi.mocked(clack.confirm).mockResolvedValueOnce(true); // Add project? Yes
    vi.mocked(clack.text).mockResolvedValueOnce("my-project"); // Project Name
    vi.mocked(clack.text).mockResolvedValueOnce("https://test.supabase.co"); // URL
    vi.mocked(clack.password).mockResolvedValueOnce("sbp_testkey"); // Key

    await initCommand.parseAsync(["node", "test"]);

    const config: Config = await fs.readJson(CONFIG_PATH);
    expect(config.projects).toHaveLength(1);
    expect(config.projects[0]?.name).toBe("my-project");
  });
});
