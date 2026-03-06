import * as clack from "@clack/prompts";
import fs from "fs-extra";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CONFIG_FILENAME, Config } from "../config";
import { removeCommand } from "./remove";

// Mock clack prompts
const cancelSymbol = Symbol("cancel");
vi.mock("@clack/prompts", () => ({
  intro: vi.fn(),
  outro: vi.fn(),
  confirm: vi.fn(),
  isCancel: vi.fn((value) => value === cancelSymbol),
  cancel: vi.fn(),
  log: {
    error: vi.fn(),
    info: vi.fn(),
    message: vi.fn(),
    warn: vi.fn(),
  },
}));

const TEST_DIR = path.join(os.tmpdir(), "supabase-keeper-test-remove");
const CONFIG_PATH = path.join(TEST_DIR, CONFIG_FILENAME);

describe("Remove Command", () => {
  let exitSpy: any;
  let cwdSpy: any;

  beforeEach(async () => {
    await fs.ensureDir(TEST_DIR);
    cwdSpy = vi.spyOn(process, "cwd").mockReturnValue(TEST_DIR);
    exitSpy = vi.spyOn(process, "exit").mockImplementation((() => {}) as any);
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await fs.remove(TEST_DIR);
    vi.restoreAllMocks();
  });

  it("should remove an existing project with confirmation", async () => {
    const initialConfig: Config = {
      projects: [
        {
          name: "project-to-remove",
          supabaseProjectUrl: "https://test.supabase.co",
          supabasePublishableKey: "key",
          createdAt: new Date(),
          lastPing: new Date(),
          status: "active",
        },
      ],
    };
    await fs.writeJson(CONFIG_PATH, initialConfig);

    vi.mocked(clack.confirm).mockResolvedValue(true);

    await removeCommand.parseAsync(["node", "remove", "project-to-remove", TEST_DIR]);

    const config: Config = await fs.readJson(CONFIG_PATH);
    expect(config.projects).toHaveLength(0);
    expect(clack.outro).toHaveBeenCalledWith(
      expect.stringContaining("removed successfully"),
    );
  });

  it("should remove an existing project with --force flag", async () => {
    const initialConfig: Config = {
      projects: [
        {
          name: "project-to-remove",
          supabaseProjectUrl: "https://test.supabase.co",
          supabasePublishableKey: "key",
          createdAt: new Date(),
          lastPing: new Date(),
          status: "active",
        },
      ],
    };
    await fs.writeJson(CONFIG_PATH, initialConfig);

    await removeCommand.parseAsync([
      "node",
      "remove",
      "project-to-remove",
      TEST_DIR,
      "--force",
    ]);

    const config: Config = await fs.readJson(CONFIG_PATH);
    expect(config.projects).toHaveLength(0);
    expect(clack.confirm).not.toHaveBeenCalled();
    expect(clack.outro).toHaveBeenCalledWith(
      expect.stringContaining("removed successfully"),
    );
  });

  it("should abort removal if confirmation is denied", async () => {
    const initialConfig: Config = {
      projects: [
        {
          name: "project-to-keep",
          supabaseProjectUrl: "https://test.supabase.co",
          supabasePublishableKey: "key",
          createdAt: new Date(),
          lastPing: new Date(),
          status: "active",
        },
      ],
    };
    await fs.writeJson(CONFIG_PATH, initialConfig);

    vi.mocked(clack.confirm).mockResolvedValue(false);

    await removeCommand.parseAsync(["node", "remove", "project-to-keep", TEST_DIR]);

    const config: Config = await fs.readJson(CONFIG_PATH);
    expect(config.projects).toHaveLength(1);
    expect(config.projects[0]?.name).toBe("project-to-keep");
    expect(clack.outro).toHaveBeenCalledWith("Operation cancelled.");
  });

  it("should abort removal if operation is cancelled (Ctrl+C)", async () => {
    const initialConfig: Config = {
      projects: [
        {
          name: "project-to-keep",
          supabaseProjectUrl: "https://test.supabase.co",
          supabasePublishableKey: "key",
          createdAt: new Date(),
          lastPing: new Date(),
          status: "active",
        },
      ],
    };
    await fs.writeJson(CONFIG_PATH, initialConfig);

    vi.mocked(clack.confirm).mockResolvedValue(cancelSymbol as any);

    await removeCommand.parseAsync(["node", "remove", "project-to-keep", TEST_DIR]);

    const config: Config = await fs.readJson(CONFIG_PATH);
    expect(config.projects).toHaveLength(1);
    expect(clack.cancel).toHaveBeenCalledWith("Operation cancelled.");
  });

  it("should show error if project does not exist", async () => {
    const initialConfig: Config = {
      projects: [],
    };
    await fs.writeJson(CONFIG_PATH, initialConfig);

    await removeCommand.parseAsync(["node", "remove", "non-existent-project", TEST_DIR]);

    expect(clack.log.error).toHaveBeenCalledWith(
      expect.stringContaining("not found"),
    );
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it("should show error if config file is missing", async () => {
    // No config file created

    await removeCommand.parseAsync(["node", "remove", "some-project", TEST_DIR]);

    expect(clack.log.error).toHaveBeenCalledWith(
      expect.stringContaining("Configuration not found"),
    );
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
