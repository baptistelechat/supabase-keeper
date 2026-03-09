import { execSync } from "child_process";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { isPM2Installed, startWithPM2, savePM2List } from "./pm2";
import { log } from "@clack/prompts";

vi.mock("child_process", () => ({
  execSync: vi.fn(),
}));

vi.mock("@clack/prompts", () => ({
  log: {
    info: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("PM2 Utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should detect PM2 if installed", () => {
    (execSync as any).mockImplementation(() => {});
    expect(isPM2Installed()).toBe(true);
  });

  it("should detect PM2 missing", () => {
    (execSync as any).mockImplementation(() => { throw new Error("not found"); });
    expect(isPM2Installed()).toBe(false);
  });

  it("should start with PM2 (new process)", () => {
    (execSync as any).mockImplementation((cmd: string) => {
      if (cmd.includes("describe")) {
        throw new Error("Process not found");
      }
    });
    expect(startWithPM2("script.js", "name")).toBe(true);
    expect(execSync).toHaveBeenCalledWith(expect.stringContaining("pm2 start"), expect.anything());
  });

  it("should restart if already running", () => {
    (execSync as any).mockImplementation(() => {});
    expect(startWithPM2("script.js", "name")).toBe(true);
    expect(execSync).toHaveBeenCalledWith(expect.stringContaining("pm2 restart"), expect.anything());
  });

  it("should save PM2 list", () => {
    (execSync as any).mockImplementation(() => {});
    expect(savePM2List()).toBe(true);
    expect(execSync).toHaveBeenCalledWith("pm2 save", expect.anything());
  });
});
