import { intro, log, outro } from "@clack/prompts";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadConfig, saveConfig } from "../config";
import { activeCommand } from "./active";

vi.mock("../config", () => ({
  loadConfig: vi.fn(),
  saveConfig: vi.fn(),
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
  const processExitSpy = vi.spyOn(process, "exit").mockImplementation((() => { throw new Error("process.exit called"); }) as any);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should exit if config not found", async () => {
    (loadConfig as any).mockResolvedValue(null);

    await expect(activeCommand.parseAsync(["node", "test", "my-project"])).rejects.toThrow("process.exit called");

    expect(loadConfig).toHaveBeenCalled();
    expect(log.error).toHaveBeenCalledWith(expect.stringContaining("Configuration file not found"));
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  it("should exit if project not found", async () => {
    (loadConfig as any).mockResolvedValue({ projects: [] });

    await expect(activeCommand.parseAsync(["node", "test", "non-existent-project"])).rejects.toThrow("process.exit called");

    expect(log.error).toHaveBeenCalledWith(expect.stringContaining("Project 'non-existent-project' not found"));
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  it("should inform if project is already active", async () => {
    (loadConfig as any).mockResolvedValue({
      projects: [
        {
          name: "my-project",
          status: "active",
        },
      ],
    });

    await activeCommand.parseAsync(["node", "test", "my-project"]);

    expect(log.info).toHaveBeenCalledWith(expect.stringContaining("is already active"));
    expect(saveConfig).not.toHaveBeenCalled();
  });

  it("should resume project and save config", async () => {
    const project = {
      name: "my-project",
      status: "paused",
    };
    (loadConfig as any).mockResolvedValue({
      projects: [project],
    });

    await activeCommand.parseAsync(["node", "test", "my-project"]);

    expect(project.status).toBe("active");
    expect(saveConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        projects: [expect.objectContaining({ status: "active" })],
      }),
      expect.any(String)
    );
    expect(log.success).toHaveBeenCalledWith(expect.stringContaining("has been resumed"));
  });
});
