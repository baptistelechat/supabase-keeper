import { intro, log, outro } from "@clack/prompts";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ensureConfig, loadConfig, saveConfig } from "../config";
import { promptForProjectDetails } from "../utils/prompts";
import { addCommand } from "./add";

vi.mock("../config", () => ({
  loadConfig: vi.fn(),
  ensureConfig: vi.fn(),
  saveConfig: vi.fn(),
  DEFAULT_CONFIG_DIR: "mocked-dir",
}));

vi.mock("../utils/prompts", () => ({
  promptForProjectDetails: vi.fn(),
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

describe("Add Command", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should add a new project successfully", async () => {
    (ensureConfig as any).mockResolvedValue({ projects: [] });
    (promptForProjectDetails as any).mockResolvedValue({
      name: "new-project",
      supabaseProjectUrl: "https://new.supabase.co",
      supabasePublishableKey: "sb_new",
    });

    await addCommand.parseAsync(["node", "test"]);

    expect(saveConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        projects: [expect.objectContaining({ name: "new-project" })],
      }),
      expect.any(String)
    );
    expect(outro).toHaveBeenCalledWith(expect.stringContaining("added successfully"));
  });

  it("should handle cancellation", async () => {
    const processExitSpy = vi.spyOn(process, "exit").mockImplementation((() => {}) as any);
    (ensureConfig as any).mockResolvedValue({ projects: [] });
    (promptForProjectDetails as any).mockResolvedValue(null);

    await addCommand.parseAsync(["node", "test"]);

    expect(saveConfig).not.toHaveBeenCalled();
    expect(processExitSpy).toHaveBeenCalledWith(0);
  });
});
