import { intro, log, outro } from "@clack/prompts";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadConfig, saveConfig } from "../config";
import { pauseCommand } from "./pause";

vi.mock("../config", () => ({
  loadConfig: vi.fn(),
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
    (loadConfig as any).mockResolvedValue(null);

    await expect(pauseCommand.parseAsync(["node", "test", "my-project"])).rejects.toThrow("process.exit called");

    expect(loadConfig).toHaveBeenCalled();
    expect(log.error).toHaveBeenCalledWith(expect.stringContaining("Configuration file not found"));
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  it("should exit if project not found", async () => {
    (loadConfig as any).mockResolvedValue({ projects: [] });

    await expect(pauseCommand.parseAsync(["node", "test", "non-existent-project"])).rejects.toThrow("process.exit called");

    expect(log.error).toHaveBeenCalledWith(expect.stringContaining("Project non-existent-project not found"));
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  it("should inform if project is already paused", async () => {
    (loadConfig as any).mockResolvedValue({
      projects: [
        {
          name: "my-project",
          status: "paused",
        },
      ],
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
    (loadConfig as any).mockResolvedValue({
      projects: [project],
    });

    await pauseCommand.parseAsync(["node", "test", "my-project"]);

    expect(project.status).toBe("paused");
    expect(saveConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        projects: [expect.objectContaining({ status: "paused" })],
      }),
      expect.any(String)
    );
    expect(log.success).toHaveBeenCalledWith(expect.stringContaining("has been paused"));
  });
});
