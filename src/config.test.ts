import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { saveConfig, loadConfig, CONFIG_FILENAME, Config } from './config';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

const TEST_DIR = path.join(os.tmpdir(), 'supabase-keeper-test-config');

describe('Config', () => {
  beforeEach(async () => {
    await fs.ensureDir(TEST_DIR);
  });

  afterEach(async () => {
    await fs.remove(TEST_DIR);
  });

  it('should save and load config', async () => {
    const config: Config = {
      projects: [
        {
          name: 'test-project',
        },
      ],
    };

    await saveConfig(config, TEST_DIR);
    const loaded = await loadConfig(TEST_DIR);

    expect(loaded).toEqual(config);
  });

  it('should return null if config does not exist', async () => {
    const loaded = await loadConfig(TEST_DIR);
    expect(loaded).toBeNull();
  });

  it('should handle invalid config file', async () => {
    const filePath = path.join(TEST_DIR, CONFIG_FILENAME);
    await fs.writeFile(filePath, 'invalid json');
    
    // Silence console.error for test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const loaded = await loadConfig(TEST_DIR);
    expect(loaded).toBeNull();
    
    consoleSpy.mockRestore();
  });
});
