import { cancel, confirm, intro, isCancel, log, outro } from "@clack/prompts";
import fs from "fs-extra";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Config, ensureConfig, ensureProject, saveConfig } from "../config";
import { removeCommand } from "./remove";

vi.mock("@clack/prompts", () => ({
  intro: vi.fn(),
  outro: vi.fn(),
  confirm: vi.fn(),
  isCancel: vi.fn(),
  cancel: vi.fn(),
  log: {
    error: vi.fn(),
    info: vi.fn(),
    message: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock("../config", () => ({
  loadConfig: vi.fn(),
  ensureConfig: vi.fn(),
  ensureProject: vi.fn(),
  saveConfig: vi.fn(),
  DEFAULT_CONFIG_DIR: "mocked-dir",
  CONFIG_FILENAME: "supabase-keeper.config.json",
}));

const TEST_DIR = path.join(os.tmpdir(), "supabase-keeper-test-remove");

describe("Remove Command", () => {
  let exitSpy: any;
  let cwdSpy: any;

  beforeEach(async () => {
    await fs.ensureDir(TEST_DIR);
    cwdSpy = vi.spyOn(process, "cwd").mockReturnValue(TEST_DIR);
    exitSpy = vi.spyOn(process, "exit").mockImplementation((() => {
      throw new Error("process.exit called");
    }) as any);
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await fs.remove(TEST_DIR);
    vi.restoreAllMocks();
  });

  it("should show error if project does not exist", async () => {
    (ensureConfig as any).mockResolvedValue({ projects: [] });
    (ensureProject as any).mockImplementation(() => {
      log.error("Project not found");
      process.exit(1);
    });

    await expect(
      removeCommand.parseAsync(["node", "remove", "non-existent-project"]),
    ).rejects.toThrow("process.exit called");

    expect(ensureProject).toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it("should remove an existing project with confirmation", async () => {
    vi.mocked(ensureConfig).mockResolvedValue({
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
    });
    (ensureProject as any).mockReturnValue({
      index: 0,
    });

    vi.mocked(confirm).mockResolvedValue(true);

    await removeCommand.parseAsync(["node", "remove", "project-to-remove"]);

    expect(saveConfig).toHaveBeenCalledWith(
      expect.objectContaining({ projects: [] }),
      expect.any(String)
    );
    expect(outro).toHaveBeenCalledWith(
      expect.stringContaining("removed successfully"),
    );
  });

  it("should remove an existing project with --force flag", async () => {
    (ensureConfig as any).mockResolvedValue({
      projects: [{ name: "project-to-remove", status: "active" }],
    });
    (ensureProject as any).mockReturnValue({
      index: 0,
    });

    await removeCommand.parseAsync([
      "node",
      "remove",
      "project-to-remove",
      "--force",
    ]);

    expect(saveConfig).toHaveBeenCalledWith(
      expect.objectContaining({ projects: [] }),
      expect.any(String)
    );
    expect(confirm).not.toHaveBeenCalled();
    expect(outro).toHaveBeenCalledWith(
      expect.stringContaining("removed successfully"),
    );
  });

  it("should abort removal if confirmation is denied", async () => {
    (ensureConfig as any).mockResolvedValue({
      projects: [{ name: "project-to-keep", status: "active" }],
    });
    (ensureProject as any).mockReturnValue({
      index: 0,
    });

    vi.mocked(confirm).mockResolvedValue(false);

    await removeCommand.parseAsync(["node", "remove", "project-to-keep"]);

    expect(saveConfig).not.toHaveBeenCalled();
    expect(outro).toHaveBeenCalledWith("Operation cancelled.");
  });

  it("should abort removal if operation is cancelled (Ctrl+C)", async () => {
    (ensureConfig as any).mockResolvedValue({
      projects: [{ name: "project-to-keep", status: "active" }],
    });
    (ensureProject as any).mockReturnValue({
      index: 0,
    });

    vi.mocked(confirm).mockResolvedValue(Symbol("cancel") as any);
    vi.mocked(isCancel).mockReturnValue(true);

    await removeCommand.parseAsync(["node", "remove", "project-to-keep"]);

    expect(saveConfig).not.toHaveBeenCalled();
    expect(cancel).toHaveBeenCalledWith("Operation cancelled.");
  });

  it("should show error if config file is missing", async () => {
    vi.mocked(ensureConfig).mockImplementation(() => {
      log.error("Configuration not found");
      process.exit(1);
    });

    exitSpy.mockImplementation(() => { throw new Error("process.exit called"); });

    await expect(
      removeCommand.parseAsync(["node", "remove", "some-project"]),
    ).rejects.toThrow("process.exit called");

    expect(log.error).toHaveBeenCalledWith(
      expect.stringContaining("Configuration not found"),
    );
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
