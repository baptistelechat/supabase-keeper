import { log } from "@clack/prompts";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ensureConfig, ensureProject, saveConfig } from "../config";
import { activeCommand } from "./active";

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

describe("active command", () => {
  const processExitSpy = vi.spyOn(process, "exit").mockImplementation((() => {
    throw new Error("process.exit called");
  }) as any);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should exit if config not found", async () => {
    (ensureConfig as any).mockImplementation(() => {
      log.error("Configuration file not found");
      process.exit(1);
    });

    await expect(
      activeCommand.parseAsync(["node", "test", "my-project"]),
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
      activeCommand.parseAsync(["node", "test", "non-existent-project"]),
    ).rejects.toThrow("process.exit called");

    expect(ensureProject).toHaveBeenCalled();
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  it("should inform if project is already active", async () => {
    (ensureConfig as any).mockResolvedValue({
      projects: [
        {
          name: "my-project",
          status: "active",
        },
      ],
    });
    (ensureProject as any).mockReturnValue({
      project: { name: "my-project", status: "active" },
      index: 0,
    });

    await activeCommand.parseAsync(["node", "test", "my-project"]);

    expect(log.info).toHaveBeenCalledWith(
      expect.stringContaining("is already active"),
    );
    expect(saveConfig).not.toHaveBeenCalled();
  });

  it("should resume project and save config", async () => {
    const project = {
      name: "my-project",
      status: "paused",
    };
    (ensureConfig as any).mockResolvedValue({
      projects: [project],
    });
    (ensureProject as any).mockReturnValue({
      project,
      index: 0,
    });

    await activeCommand.parseAsync(["node", "test", "my-project"]);

    expect(project.status).toBe("active");
    expect(saveConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        projects: [expect.objectContaining({ status: "active" })],
      }),
      expect.any(String),
    );
    expect(log.success).toHaveBeenCalledWith(
      expect.stringContaining("has been resumed"),
    );
  });
});
