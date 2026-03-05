import * as clack from "@clack/prompts";
import fs from "fs-extra";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CONFIG_FILENAME, Config } from "../config";
import { addCommand } from "./add";

// Mock Supabase client
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  maybeSingle: vi.fn(),
};

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => mockSupabase),
}));

// Mock clack prompts
vi.mock("@clack/prompts", () => ({
  intro: vi.fn(),
  outro: vi.fn(),
  text: vi.fn(),
  password: vi.fn(),
  confirm: vi.fn(),
  select: vi.fn(),
  isCancel: vi.fn(() => false),
  cancel: vi.fn(),
  log: {
    error: vi.fn(),
    info: vi.fn(),
    message: vi.fn(),
    warn: vi.fn(),
  },
  spinner: () => ({ start: vi.fn(), stop: vi.fn() }),
}));

const TEST_DIR = path.join(os.tmpdir(), "supabase-keeper-test-add");
const CONFIG_PATH = path.join(TEST_DIR, CONFIG_FILENAME);

describe("Add Command", () => {
  let cwdSpy: any;
  let exitSpy: any;

  beforeEach(async () => {
    await fs.ensureDir(TEST_DIR);
    await fs.writeJson(CONFIG_PATH, { projects: [] });
    cwdSpy = vi.spyOn(process, "cwd").mockReturnValue(TEST_DIR);
    exitSpy = vi.spyOn(process, "exit").mockImplementation((() => {}) as any);
    vi.clearAllMocks();
    mockSupabase.maybeSingle.mockReset();
    vi.mocked(clack.text).mockReset();
    vi.mocked(clack.password).mockReset();
    vi.mocked(clack.select).mockReset();
  });

  afterEach(async () => {
    await fs.remove(TEST_DIR);
    vi.restoreAllMocks();
  });

  it("should add a new project successfully", async () => {
    // Mock inputs
    vi.mocked(clack.text).mockResolvedValueOnce("new-project"); // Name
    vi.mocked(clack.text).mockResolvedValueOnce("https://test.supabase.co"); // URL
    vi.mocked(clack.password).mockResolvedValueOnce("sbp_testkey"); // Key

    // Mock Supabase success (PGRST204 = table not found, which means connection OK)
    mockSupabase.maybeSingle.mockResolvedValue({
      error: { code: "PGRST204", message: "relation not found" },
    });

    await addCommand.parseAsync(["node", "test"]);

    const config: Config = await fs.readJson(CONFIG_PATH);
    expect(config.projects).toHaveLength(1);
    expect(config.projects[0]?.name).toBe("new-project");
    expect(config.projects[0]?.supabaseProjectUrl).toBe(
      "https://test.supabase.co",
    );
    expect(config.projects[0]?.createdAt).toBeDefined();
    expect(config.projects[0]?.status).toBe("active");
    expect(config.projects[0]?.lastPing).toBeDefined();
    expect(clack.outro).toHaveBeenCalled();
  });

  it("should handle validation failure and cancel", async () => {
    // Mock inputs
    vi.mocked(clack.text).mockResolvedValueOnce("bad-project");
    vi.mocked(clack.text).mockResolvedValueOnce("https://bad.supabase.co");
    vi.mocked(clack.password).mockResolvedValueOnce("sbp_badkey");

    // Mock Supabase failure (401)
    mockSupabase.maybeSingle.mockResolvedValueOnce({
      error: { code: "401", message: "Unauthorized" },
    });

    // Select "cancel"
    vi.mocked(clack.select).mockResolvedValueOnce("cancel" as any);

    await addCommand.parseAsync(["node", "test"]);

    expect(exitSpy).toHaveBeenCalledWith(0);
    expect(clack.cancel).toHaveBeenCalledWith("Operation cancelled.");

    // Verify config unchanged
    const config: Config = await fs.readJson(CONFIG_PATH);
    expect(config.projects).toHaveLength(0);
  });

  it("should handle validation failure and force add", async () => {
    // Mock inputs
    vi.mocked(clack.text).mockResolvedValueOnce("forced-project");
    vi.mocked(clack.text).mockResolvedValueOnce("https://forced.supabase.co");
    vi.mocked(clack.password).mockResolvedValueOnce("sbp_forcedkey");

    // Mock Supabase failure (Network Error)
    mockSupabase.maybeSingle.mockResolvedValueOnce({
      error: { message: "fetch failed" },
    });

    // Select "force"
    vi.mocked(clack.select).mockResolvedValueOnce("force" as any);

    await addCommand.parseAsync(["node", "test"]);

    const config: Config = await fs.readJson(CONFIG_PATH);
    expect(config.projects).toHaveLength(1);
    expect(config.projects[0]?.name).toBe("forced-project");
    expect(config.projects[0]?.status).toBe("error");
    expect(config.projects[0]?.lastPing).toBeUndefined();
  });

  it("should handle retry", async () => {
    // Mock inputs
    vi.mocked(clack.text).mockResolvedValueOnce("retry-project"); // Name

    // First attempt: Bad URL/Key
    vi.mocked(clack.text).mockResolvedValueOnce("https://bad.supabase.co");
    vi.mocked(clack.password).mockResolvedValueOnce("sbp_badkey");

    // Mock Supabase failure (401)
    mockSupabase.maybeSingle.mockResolvedValueOnce({
      error: { code: "401", message: "Unauthorized" },
    });

    // Select "retry"
    vi.mocked(clack.select).mockResolvedValueOnce("retry" as any);

    // Second attempt: Good URL/Key
    vi.mocked(clack.text).mockResolvedValueOnce("https://good.supabase.co");
    vi.mocked(clack.password).mockResolvedValueOnce("sbp_goodkey");

    // Mock Supabase success
    mockSupabase.maybeSingle.mockResolvedValueOnce({
      error: { code: "PGRST204", message: "relation not found" },
    });

    await addCommand.parseAsync(["node", "test"]);

    const config: Config = await fs.readJson(CONFIG_PATH);
    expect(config.projects).toHaveLength(1);
    expect(config.projects[0]?.name).toBe("retry-project");
    expect(config.projects[0]?.supabaseProjectUrl).toBe("https://good.supabase.co");
    expect(config.projects[0]?.status).toBe("active");
    expect(config.projects[0]?.lastPing).toBeDefined();
  });

  it("should error if config does not exist", async () => {
    await fs.remove(CONFIG_PATH);

    await addCommand.parseAsync(["node", "test"]);

    expect(clack.log.error).toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
