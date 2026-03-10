import { log } from "@clack/prompts";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ensureConfig, saveConfig } from "../config";
import { logPing } from "../utils/ping-logger";
import { validateSupabaseConnection } from "../utils/validation";
import { pingCommand } from "./ping";

vi.mock("../config", () => ({
  ensureConfig: vi.fn(),
  saveConfig: vi.fn(),
  DEFAULT_CONFIG_DIR: "mocked-dir",
}));

vi.mock("../utils/ping-logger", () => ({
  logPing: vi.fn(),
}));

vi.mock("../utils/validation", () => ({
  validateSupabaseConnection: vi.fn(),
}));

vi.mock("@clack/prompts", () => ({
  intro: vi.fn(),
  log: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
  outro: vi.fn(),
}));

describe("ping command", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should warn if no active projects", async () => {
    (ensureConfig as any).mockResolvedValue({ projects: [] });

    await pingCommand.parseAsync(["node", "test"]);

    expect(log.warn).toHaveBeenCalledWith(
      expect.stringContaining("No active projects"),
    );
    expect(validateSupabaseConnection).not.toHaveBeenCalled();
  });

  it("should ping active projects and update status on success", async () => {
    const mockProject = {
      name: "test-project",
      supabaseProjectUrl: "https://test.supabase.co",
      supabasePublishableKey: "sbp_key",
      status: "active",
      lastPing: undefined as Date | undefined,
    };

    (ensureConfig as any).mockResolvedValue({
      projects: [mockProject],
    });

    (validateSupabaseConnection as any).mockResolvedValue({
      isValid: true,
      message: "Connection verified!",
    });

    await pingCommand.parseAsync(["node", "test"]);

    expect(validateSupabaseConnection).toHaveBeenCalledWith(
      "https://test.supabase.co",
      "sbp_key",
    );

    expect(log.info).toHaveBeenCalledWith(expect.stringContaining("Success"));
    expect(logPing).toHaveBeenCalledWith(
      "test-project",
      true,
      expect.stringContaining("Status: Connection verified!"),
      expect.any(String),
    );
    expect(saveConfig).toHaveBeenCalled();
    // Verify lastPing was updated
    expect(mockProject.lastPing).toBeInstanceOf(Date);
  });

  it("should handle ping failure", async () => {
    const mockProject = {
      name: "fail-project",
      supabaseProjectUrl: "https://fail.supabase.co",
      supabasePublishableKey: "sbp_key",
      status: "active",
    };

    (ensureConfig as any).mockResolvedValue({
      projects: [mockProject],
    });

    (validateSupabaseConnection as any).mockResolvedValue({
      isValid: false,
      message: "Network error",
    });

    await pingCommand.parseAsync(["node", "test"]);

    expect(log.error).toHaveBeenCalledWith(expect.stringContaining("Failed"));
    expect(logPing).toHaveBeenCalledWith(
      "fail-project",
      false,
      expect.stringContaining("Status: Network error"),
      expect.any(String),
    );
    // Config should still be saved (ping cycle complete)
    expect(saveConfig).toHaveBeenCalled();
  });

  it("should handle unexpected errors during ping", async () => {
    const mockProject = {
      name: "error-project",
      supabaseProjectUrl: "https://error.supabase.co",
      supabasePublishableKey: "sbp_key",
      status: "active",
    };

    (ensureConfig as any).mockResolvedValue({
      projects: [mockProject],
    });

    (validateSupabaseConnection as any).mockRejectedValue(
      new Error("Unexpected crash"),
    );

    await pingCommand.parseAsync(["node", "test"]);

    expect(log.error).toHaveBeenCalledWith(expect.stringContaining("Error"));
    expect(logPing).toHaveBeenCalledWith(
      "error-project",
      false,
      expect.stringContaining("Error: Unexpected crash"),
      expect.any(String),
    );
    expect(saveConfig).toHaveBeenCalled();
  });
});
