import { log } from "@clack/prompts";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadConfig } from "../config";
import { listCommand } from "./list";

vi.mock("../config", () => ({
  loadConfig: vi.fn(),
  DEFAULT_CONFIG_DIR: "mocked-dir",
}));

vi.mock("@clack/prompts", () => ({
  intro: vi.fn(),
  log: {
    info: vi.fn(),
  },
  outro: vi.fn(),
}));

// Mock cli-table3
const mockTablePush = vi.fn();
const mockTableToString = vi.fn().mockReturnValue("MOCK_TABLE_OUTPUT");

vi.mock("cli-table3", () => {
  return {
    default: class MockTable {
      constructor() {}
      push(...args: any[]) {
        mockTablePush(...args);
      }
      toString() {
        return mockTableToString();
      }
    },
  };
});

describe("list command", () => {
  const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

  beforeEach(() => {
    vi.clearAllMocks();
    mockTablePush.mockClear();
    mockTableToString.mockClear();
  });

  it("should display message when no config found", async () => {
    vi.mocked(loadConfig).mockResolvedValue(null);

    await listCommand.parseAsync(["node", "test"]);

    expect(loadConfig).toHaveBeenCalled();
    expect(log.info).toHaveBeenCalledWith(
      expect.stringContaining("No projects found"),
    );
  });

  it("should display projects table when config exists", async () => {
    const mockDate = new Date("2023-01-01T00:00:00.000Z");
    vi.mocked(loadConfig).mockResolvedValue({
      projects: [
        {
          name: "test-project",
          supabaseProjectUrl: "https://test.supabase.co",
          supabasePublishableKey: "sbp_1234567890",
          status: "active",
          lastPing: mockDate,
          createdAt: mockDate,
        },
      ],
    });

    await listCommand.parseAsync(["node", "test"]);

    expect(loadConfig).toHaveBeenCalled();
    // Verify table push was called with correct data
    expect(mockTablePush).toHaveBeenCalledWith([
      "test-project",
      "https://test.supabase.co", // No longer expecting color codes or partial match
      "...7890",
      expect.stringContaining("active"),
      mockDate.toLocaleString(),
      mockDate.toLocaleString(),
    ]);
    // Verify console.log outputted the table
    expect(consoleLogSpy).toHaveBeenCalledWith("MOCK_TABLE_OUTPUT");
  });

  it("should display createdAt if lastPing is missing", async () => {
    const mockDate = new Date("2023-01-01T00:00:00.000Z");
    vi.mocked(loadConfig).mockResolvedValue({
      projects: [
        {
          name: "test-project-2",
          supabaseProjectUrl: "https://test2.supabase.co",
          supabasePublishableKey: "sbp_abcdef",
          status: "paused",
          createdAt: mockDate,
          lastPing: undefined,
        },
      ],
    });

    await listCommand.parseAsync(["node", "test"]);

    expect(mockTablePush).toHaveBeenCalledWith([
      "test-project-2",
      "https://test2.supabase.co",
      "...cdef",
      expect.stringContaining("paused"),
      mockDate.toLocaleString(),
      "Never",
    ]);
  });

  it("should display Never if both lastPing and createdAt are missing", async () => {
    vi.mocked(loadConfig).mockResolvedValue({
      projects: [
        {
          name: "test-project-3",
          supabaseProjectUrl: "https://test3.supabase.co",
          supabasePublishableKey: "sbp_xyz",
          status: "error",
          createdAt: undefined,
          lastPing: undefined,
        },
      ],
    });

    await listCommand.parseAsync(["node", "test"]);

    expect(mockTablePush).toHaveBeenCalledWith([
      "test-project-3",
      "https://test3.supabase.co",
      "..._xyz",
      expect.stringContaining("error"),
      "Unknown",
      "Never",
    ]);
  });
});
