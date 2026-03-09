import { intro, log, outro } from "@clack/prompts";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ensureConfig, ensureProject, saveConfig } from "../config";
import { pauseCommand } from "./pause";

vi.mock("../config", () => ({
  loadConfig: vi.fn(),
  ensureConfig: vi.fn(),
  ensureProject: vi.fn(),
  saveConfig: vi.fn(),
  DEFAULT_CONFIG_DIR: "mocked-dir",
}));

vi.mock("@clack/prompts", () => ({
  intro: vi.fn(),
  log: {
    info: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  },
  outro: vi.fn(),
}));

describe("pause command", () => {
  const processExitSpy = vi.spyOn(process, "exit").mockImplementation((() => { throw new Error("process.exit called"); }) as any);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should exit if config not found", async () => {
    (ensureConfig as any).mockImplementation(() => {
        log.error("Configuration file not found");
        process.exit(1);
    });

    await expect(
      pauseCommand.parseAsync(["node", "test", "my-project"]),
    ).rejects.toThrow("process.exit called");

    expect(ensureConfig).toHaveBeenCalled();
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  it("should exit if project not found", async () => {
    (ensureConfig as any).mockResolvedValue({ projects: [] });
    (ensureProject as any).mockImplementation(() => {
      log.error("Project not found");
      process.exit(1);
    });

    await expect(
      pauseCommand.parseAsync(["node", "test", "non-existent-project"]),
    ).rejects.toThrow("process.exit called");

    expect(ensureProject).toHaveBeenCalled();
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  it("should inform if project is already paused", async () => {
    (ensureConfig as any).mockResolvedValue({
      projects: [
        {
          name: "my-project",
          status: "paused",
        },
      ],
    });
    (ensureProject as any).mockReturnValue({
      project: { name: "my-project", status: "paused" },
      index: 0,
    });

    await pauseCommand.parseAsync(["node", "test", "my-project"]);

    expect(log.info).toHaveBeenCalledWith(expect.stringContaining("is already paused"));
    expect(saveConfig).not.toHaveBeenCalled();
  });

  it("should pause project and save config", async () => {
    const project = {
      name: "my-project",
      status: "active",
    };
    (ensureConfig as any).mockResolvedValue({
      projects: [project],
    });
    (ensureProject as any).mockReturnValue({
      project,
      index: 0,
    });

    await pauseCommand.parseAsync(["node", "test", "my-project"]);

    expect(project.status).toBe("paused");
    expect(saveConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        projects: [expect.objectContaining({ status: "paused" })],
      }),
      expect.any(String)
    );
    expect(outro).toHaveBeenCalledWith(expect.stringContaining("has been paused"));
  });
});
